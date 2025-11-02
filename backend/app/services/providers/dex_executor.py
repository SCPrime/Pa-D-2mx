"""
DEX Execution Service
Handles actual token swaps on Uniswap V3 with safety checks and status tracking.
"""

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from .web3_client import Web3Client, WEB3_AVAILABLE, USDC_ADDRESS, WMATIC_ADDRESS

logger = logging.getLogger(__name__)


class DEXExecutor:
    """
    Execute DEX token swaps with safety checks

    Safety Features:
    - Max slippage enforcement
    - Gas price limits
    - Daily volume limits
    - Wallet balance validation
    - Dry-run mode support
    """

    def __init__(
        self,
        web3_client: Web3Client | None = None,
        max_slippage_bps: int = 100,  # 1% default
        max_gas_price_gwei: int = 500,  # Polygon gas limit
        daily_volume_limit_usd: float = 10000.0,
        dry_run: bool = False,
    ):
        if not WEB3_AVAILABLE:
            logger.warning("[DEX] Web3 not available - executor in simulation mode")
            self.web3_client = None
            self.dry_run = True
        else:
            self.web3_client = web3_client or Web3Client()
            self.dry_run = dry_run or os.getenv("DRY_RUN_MODE", "false").lower() == "true"

        self.max_slippage_bps = max_slippage_bps
        self.max_gas_price_gwei = max_gas_price_gwei
        self.daily_volume_limit_usd = daily_volume_limit_usd

        # Daily volume tracking (in-memory - should be persisted in production)
        self._daily_volume: dict[str, float] = {}
        self._last_reset_date: str | None = None

    def _reset_daily_volume_if_needed(self):
        """Reset daily volume counter at midnight UTC"""
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        if self._last_reset_date != today:
            logger.info(f"[DEX] Resetting daily volume for {today}")
            self._daily_volume = {}
            self._last_reset_date = today

    def _check_daily_volume_limit(self, amount_usd: float, symbol: str):
        """Enforce daily volume limit per token"""
        self._reset_daily_volume_if_needed()

        current_volume = self._daily_volume.get(symbol, 0.0)
        new_volume = current_volume + amount_usd

        if new_volume > self.daily_volume_limit_usd:
            raise ValueError(
                f"Daily volume limit exceeded for {symbol}: "
                f"${new_volume:.2f} > ${self.daily_volume_limit_usd:.2f}"
            )

        self._daily_volume[symbol] = new_volume
        logger.info(
            f"[DEX] Daily volume for {symbol}: ${new_volume:.2f} / ${self.daily_volume_limit_usd:.2f}"
        )

    def _calculate_min_output(
        self, expected_output_wei: int, slippage_bps: int | None = None
    ) -> int:
        """
        Calculate minimum output amount with slippage protection

        Args:
            expected_output_wei: Expected output in wei
            slippage_bps: Slippage tolerance in basis points (default: self.max_slippage_bps)

        Returns:
            Minimum output amount in wei
        """
        slippage_bps = slippage_bps or self.max_slippage_bps

        # Validate slippage is within limit
        if slippage_bps > self.max_slippage_bps:
            raise ValueError(
                f"Slippage {slippage_bps}bps exceeds max {self.max_slippage_bps}bps"
            )

        # Calculate min output: expected * (1 - slippage)
        slippage_multiplier = Decimal(10000 - slippage_bps) / Decimal(10000)
        min_output = int(Decimal(expected_output_wei) * slippage_multiplier)

        logger.info(
            f"[DEX] Slippage protection: expected={expected_output_wei} wei, "
            f"min={min_output} wei ({slippage_bps}bps tolerance)"
        )

        return min_output

    def execute_swap(
        self,
        token_in: str,
        token_out: str,
        amount_in: Decimal,  # Human-readable amount
        expected_output: Decimal,  # Human-readable expected output
        slippage_bps: int | None = None,
        token_in_decimals: int = 18,
        token_out_decimals: int = 18,
        symbol: str = "UNKNOWN",
    ) -> dict[str, Any]:
        """
        Execute token swap with safety checks

        Args:
            token_in: Input token address
            token_out: Output token address
            amount_in: Amount to swap (human-readable, e.g., 1.5 MATIC)
            expected_output: Expected output amount (for slippage calculation)
            slippage_bps: Slippage tolerance (default: self.max_slippage_bps)
            token_in_decimals: Input token decimals
            token_out_decimals: Output token decimals
            symbol: Token symbol for logging/volume tracking

        Returns:
            Execution result with transaction details
        """
        if not WEB3_AVAILABLE or self.web3_client is None:
            return self._simulate_swap(
                token_in, token_out, amount_in, expected_output, symbol
            )

        try:
            # 1. Check if connected
            if not self.web3_client.is_connected():
                raise ConnectionError("Web3 client not connected to blockchain")

            # 2. Convert to wei
            amount_in_wei = int(amount_in * Decimal(10**token_in_decimals))
            expected_output_wei = int(expected_output * Decimal(10**token_out_decimals))

            # 3. Calculate minimum output with slippage
            min_output_wei = self._calculate_min_output(expected_output_wei, slippage_bps)

            # 4. Check wallet balance
            balance = self.web3_client.get_balance(
                None if token_in.lower() == WMATIC_ADDRESS.lower() else token_in
            )
            if balance < amount_in:
                raise ValueError(
                    f"Insufficient balance: {balance} < {amount_in} {symbol}"
                )

            # 5. Check gas price
            current_gas_price_gwei = self.web3_client.w3.from_wei(
                self.web3_client.get_gas_price(), "gwei"
            )
            if current_gas_price_gwei > self.max_gas_price_gwei:
                raise ValueError(
                    f"Gas price too high: {current_gas_price_gwei} > {self.max_gas_price_gwei} gwei"
                )

            # 6. Estimate gas cost
            gas_estimate = self.web3_client.estimate_swap_gas(
                token_in, token_out, amount_in_wei, min_output_wei
            )

            # 7. Check daily volume limit
            amount_usd = float(amount_in)  # Simplified - should use price oracle
            self._check_daily_volume_limit(amount_usd, symbol)

            # 8. Dry-run check
            if self.dry_run:
                logger.info(
                    f"[DEX] DRY RUN: Would swap {amount_in} {symbol} → {expected_output} "
                    f"(min: {Decimal(min_output_wei) / Decimal(10**token_out_decimals)})"
                )
                return {
                    "status": "dry_run",
                    "token_in": token_in,
                    "token_out": token_out,
                    "amount_in": str(amount_in),
                    "expected_output": str(expected_output),
                    "min_output": str(Decimal(min_output_wei) / Decimal(10**token_out_decimals)),
                    "gas_estimate": gas_estimate,
                    "message": "Dry run mode - no transaction sent",
                }

            # 9. Approve token spending (if not native MATIC)
            if token_in.lower() != WMATIC_ADDRESS.lower():
                logger.info(f"[DEX] Approving {symbol} for router...")
                approval_result = self.web3_client.approve_token(
                    token_in,
                    self.web3_client.router.address,
                    amount_in_wei,
                )
                logger.info(f"[DEX] Approval successful: {approval_result['tx_hash']}")

            # 10. Execute swap
            logger.info(f"[DEX] Executing swap: {amount_in} {symbol}...")
            swap_result = self.web3_client.swap_exact_input_single(
                token_in,
                token_out,
                amount_in_wei,
                min_output_wei,
            )

            # 11. Return result
            return {
                "status": "success" if swap_result["status"] == "success" else "failed",
                "tx_hash": swap_result["tx_hash"],
                "token_in": token_in,
                "token_out": token_out,
                "amount_in": str(amount_in),
                "expected_output": str(expected_output),
                "min_output": str(Decimal(min_output_wei) / Decimal(10**token_out_decimals)),
                "gas_used": swap_result["gas_used"],
                "block_number": swap_result["block_number"],
                "gas_estimate": gas_estimate,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

        except Exception as e:
            logger.error(f"[DEX] Swap execution failed: {e}")
            return {
                "status": "error",
                "error": str(e),
                "token_in": token_in,
                "token_out": token_out,
                "amount_in": str(amount_in),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

    def _simulate_swap(
        self,
        token_in: str,
        token_out: str,
        amount_in: Decimal,
        expected_output: Decimal,
        symbol: str,
    ) -> dict[str, Any]:
        """Simulate swap when Web3 is not available"""
        logger.info(
            f"[DEX] SIMULATION: Would swap {amount_in} {symbol} → {expected_output}"
        )
        return {
            "status": "simulated",
            "token_in": token_in,
            "token_out": token_out,
            "amount_in": str(amount_in),
            "expected_output": str(expected_output),
            "message": "Simulation mode - Web3 not available",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def get_daily_volume_status(self) -> dict[str, Any]:
        """Get current daily volume statistics"""
        self._reset_daily_volume_if_needed()
        return {
            "date": self._last_reset_date,
            "volumes": self._daily_volume.copy(),
            "limit_usd": self.daily_volume_limit_usd,
            "total_usd": sum(self._daily_volume.values()),
            "remaining_usd": self.daily_volume_limit_usd - sum(self._daily_volume.values()),
        }


# Singleton instance
_dex_executor: DEXExecutor | None = None


def get_dex_executor() -> DEXExecutor:
    """Get or create DEX executor singleton"""
    global _dex_executor
    if _dex_executor is None:
        _dex_executor = DEXExecutor()
    return _dex_executor


__all__ = ["DEXExecutor", "get_dex_executor"]

