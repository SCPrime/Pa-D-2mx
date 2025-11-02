"""
Web3 Client for DEX Integration
Handles blockchain interactions for Uniswap V3 token swaps on Polygon.
"""

from __future__ import annotations

import logging
import os
from decimal import Decimal
from typing import Any

logger = logging.getLogger(__name__)

# Web3 imports with graceful fallback for environments without Web3
try:
    from web3 import Web3
    from web3.exceptions import Web3Exception
    from eth_account import Account
    from eth_account.signers.local import LocalAccount
    WEB3_AVAILABLE = True
except ImportError:
    WEB3_AVAILABLE = False
    logger.warning("[DEX] Web3 libraries not installed - DEX functionality disabled")
    Web3 = None  # type: ignore
    Web3Exception = Exception  # type: ignore
    Account = None  # type: ignore
    LocalAccount = None  # type: ignore


# Uniswap V3 Router ABI (minimal - just swap functions)
UNISWAP_V3_ROUTER_ABI = [
    {
        "inputs": [
            {
                "components": [
                    {"internalType": "address", "name": "tokenIn", "type": "address"},
                    {"internalType": "address", "name": "tokenOut", "type": "address"},
                    {"internalType": "uint24", "name": "fee", "type": "uint24"},
                    {"internalType": "address", "name": "recipient", "type": "address"},
                    {"internalType": "uint256", "name": "deadline", "type": "uint256"},
                    {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
                    {"internalType": "uint256", "name": "amountOutMinimum", "type": "uint256"},
                    {"internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160"},
                ],
                "internalType": "struct ISwapRouter.ExactInputSingleParams",
                "name": "params",
                "type": "tuple",
            }
        ],
        "name": "exactInputSingle",
        "outputs": [{"internalType": "uint256", "name": "amountOut", "type": "uint256"}],
        "stateMutability": "payable",
        "type": "function",
    }
]

# Polygon Mainnet Contract Addresses
UNISWAP_V3_ROUTER_POLYGON = "0xE592427A0AEce92De3Edee1F18E0157C05861564"
WMATIC_ADDRESS = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"
USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"

# ERC20 ABI (minimal - just approve and balance functions)
ERC20_ABI = [
    {
        "constant": False,
        "inputs": [
            {"name": "_spender", "type": "address"},
            {"name": "_value", "type": "uint256"},
        ],
        "name": "approve",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function",
    },
    {
        "constant": True,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function",
    },
    {
        "constant": True,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function",
    },
]


class Web3Client:
    """Web3 client for Polygon blockchain interactions"""

    def __init__(
        self,
        rpc_url: str | None = None,
        private_key: str | None = None,
        chain_id: int = 137,  # Polygon Mainnet
    ):
        if not WEB3_AVAILABLE:
            raise ImportError(
                "Web3 libraries not installed. Install with: pip install web3 eth-account"
            )

        self.rpc_url = rpc_url or os.getenv("DEX_RPC_URL")
        self.private_key = private_key or os.getenv("DEX_PRIVATE_KEY")
        self.chain_id = chain_id

        if not self.rpc_url:
            raise ValueError("DEX_RPC_URL not configured")

        # Initialize Web3
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))

        # Initialize account if private key provided
        self.account: LocalAccount | None = None
        if self.private_key:
            self.account = Account.from_key(self.private_key)
            logger.info(f"[DEX] Web3 client initialized for wallet: {self.account.address}")
        else:
            logger.warning("[DEX] No private key provided - read-only mode")

        # Initialize Uniswap V3 Router contract
        self.router = self.w3.eth.contract(
            address=Web3.to_checksum_address(UNISWAP_V3_ROUTER_POLYGON),
            abi=UNISWAP_V3_ROUTER_ABI,
        )

    def is_connected(self) -> bool:
        """Check if connected to blockchain"""
        try:
            return self.w3.is_connected()
        except Exception as e:
            logger.error(f"[DEX] Connection check failed: {e}")
            return False

    def get_balance(self, token_address: str | None = None) -> Decimal:
        """
        Get balance of token or native currency (MATIC)

        Args:
            token_address: ERC20 token address (None for MATIC)

        Returns:
            Balance in human-readable units (not wei)
        """
        if not self.account:
            raise ValueError("No account configured - cannot check balance")

        try:
            if token_address is None:
                # Native MATIC balance
                balance_wei = self.w3.eth.get_balance(self.account.address)
                return Decimal(self.w3.from_wei(balance_wei, "ether"))
            else:
                # ERC20 token balance
                token_contract = self.w3.eth.contract(
                    address=Web3.to_checksum_address(token_address),
                    abi=ERC20_ABI,
                )
                decimals = token_contract.functions.decimals().call()
                balance_raw = token_contract.functions.balanceOf(self.account.address).call()
                return Decimal(balance_raw) / Decimal(10**decimals)
        except Exception as e:
            logger.error(f"[DEX] Balance check failed for {token_address}: {e}")
            raise

    def approve_token(
        self, token_address: str, spender_address: str, amount_wei: int
    ) -> dict[str, Any]:
        """
        Approve token spending (required before swap)

        Args:
            token_address: ERC20 token to approve
            spender_address: Contract that will spend tokens (usually router)
            amount_wei: Amount to approve in wei

        Returns:
            Transaction receipt
        """
        if not self.account:
            raise ValueError("No account configured - cannot approve")

        try:
            token_contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(token_address),
                abi=ERC20_ABI,
            )

            # Build transaction
            tx = token_contract.functions.approve(
                Web3.to_checksum_address(spender_address), amount_wei
            ).build_transaction(
                {
                    "from": self.account.address,
                    "nonce": self.w3.eth.get_transaction_count(self.account.address),
                    "gas": 100000,  # Approval typically costs ~50k gas
                    "gasPrice": self.w3.eth.gas_price,
                    "chainId": self.chain_id,
                }
            )

            # Sign and send
            signed_tx = self.account.sign_transaction(tx)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)

            logger.info(f"[DEX] Approval tx sent: {tx_hash.hex()}")

            # Wait for receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=180)

            return {
                "tx_hash": tx_hash.hex(),
                "status": "success" if receipt["status"] == 1 else "failed",
                "gas_used": receipt["gasUsed"],
                "block_number": receipt["blockNumber"],
            }
        except Exception as e:
            logger.error(f"[DEX] Token approval failed: {e}")
            raise

    def swap_exact_input_single(
        self,
        token_in: str,
        token_out: str,
        amount_in_wei: int,
        amount_out_min_wei: int,
        fee: int = 3000,  # 0.3% pool fee (most common)
        deadline_seconds: int = 300,  # 5 minutes
    ) -> dict[str, Any]:
        """
        Execute exact input single swap on Uniswap V3

        Args:
            token_in: Input token address
            token_out: Output token address
            amount_in_wei: Amount to swap (in wei)
            amount_out_min_wei: Minimum output amount (slippage protection)
            fee: Pool fee tier (500=0.05%, 3000=0.3%, 10000=1%)
            deadline_seconds: Deadline from now

        Returns:
            Transaction receipt with swap details
        """
        if not self.account:
            raise ValueError("No account configured - cannot swap")

        try:
            deadline = self.w3.eth.get_block("latest")["timestamp"] + deadline_seconds

            # Build swap parameters
            params = {
                "tokenIn": Web3.to_checksum_address(token_in),
                "tokenOut": Web3.to_checksum_address(token_out),
                "fee": fee,
                "recipient": self.account.address,
                "deadline": deadline,
                "amountIn": amount_in_wei,
                "amountOutMinimum": amount_out_min_wei,
                "sqrtPriceLimitX96": 0,  # No price limit
            }

            # Estimate gas
            try:
                gas_estimate = self.router.functions.exactInputSingle(params).estimate_gas(
                    {"from": self.account.address, "value": 0}
                )
                gas_limit = int(gas_estimate * 1.2)  # 20% buffer
            except Exception as e:
                logger.warning(f"[DEX] Gas estimation failed, using default: {e}")
                gas_limit = 300000  # Default for swaps

            # Build transaction
            tx = self.router.functions.exactInputSingle(params).build_transaction(
                {
                    "from": self.account.address,
                    "nonce": self.w3.eth.get_transaction_count(self.account.address),
                    "gas": gas_limit,
                    "gasPrice": self.w3.eth.gas_price,
                    "chainId": self.chain_id,
                    "value": 0,
                }
            )

            # Sign and send
            signed_tx = self.account.sign_transaction(tx)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)

            logger.info(f"[DEX] Swap tx sent: {tx_hash.hex()}")

            # Wait for receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=180)

            return {
                "tx_hash": tx_hash.hex(),
                "status": "success" if receipt["status"] == 1 else "failed",
                "gas_used": receipt["gasUsed"],
                "block_number": receipt["blockNumber"],
                "effective_gas_price": receipt.get("effectiveGasPrice"),
            }
        except Exception as e:
            logger.error(f"[DEX] Swap failed: {e}")
            raise

    def get_gas_price(self) -> int:
        """Get current gas price in wei"""
        return self.w3.eth.gas_price

    def estimate_swap_gas(
        self,
        token_in: str,
        token_out: str,
        amount_in_wei: int,
        amount_out_min_wei: int,
    ) -> dict[str, Any]:
        """
        Estimate gas cost for a swap without executing

        Returns:
            Gas estimate and cost in MATIC
        """
        if not self.account:
            raise ValueError("No account configured")

        try:
            deadline = self.w3.eth.get_block("latest")["timestamp"] + 300

            params = {
                "tokenIn": Web3.to_checksum_address(token_in),
                "tokenOut": Web3.to_checksum_address(token_out),
                "fee": 3000,
                "recipient": self.account.address,
                "deadline": deadline,
                "amountIn": amount_in_wei,
                "amountOutMinimum": amount_out_min_wei,
                "sqrtPriceLimitX96": 0,
            }

            gas_estimate = self.router.functions.exactInputSingle(params).estimate_gas(
                {"from": self.account.address, "value": 0}
            )

            gas_price = self.w3.eth.gas_price
            gas_cost_wei = gas_estimate * gas_price
            gas_cost_matic = self.w3.from_wei(gas_cost_wei, "ether")

            return {
                "gas_estimate": gas_estimate,
                "gas_price_gwei": self.w3.from_wei(gas_price, "gwei"),
                "gas_cost_matic": float(gas_cost_matic),
                "gas_cost_wei": gas_cost_wei,
            }
        except Exception as e:
            logger.error(f"[DEX] Gas estimation failed: {e}")
            raise


# Singleton instance
_web3_client: Web3Client | None = None


def get_web3_client() -> Web3Client:
    """Get or create Web3 client singleton"""
    global _web3_client
    if _web3_client is None:
        _web3_client = Web3Client()
    return _web3_client


__all__ = ["Web3Client", "get_web3_client", "WEB3_AVAILABLE"]

