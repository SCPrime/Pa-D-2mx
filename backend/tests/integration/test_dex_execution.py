"""
Integration tests for DEX execution service
Tests Web3 client and DEX executor with mock/testnet

NOTE: These tests require:
1. Web3 libraries installed (web3, eth-account)
2. Valid RPC URL (testnet or mainnet)
3. Private key for testnet wallet (NEVER use mainnet key in tests)
"""

import os
import pytest
from decimal import Decimal

# Import with graceful fallback
try:
    from app.services.providers.web3_client import Web3Client, WEB3_AVAILABLE
    from app.services.providers.dex_executor import DEXExecutor
except ImportError:
    pytest.skip("Web3 libraries not installed", allow_module_level=True)


@pytest.mark.skipif(not WEB3_AVAILABLE, reason="Web3 not installed")
class TestWeb3Client:
    """Test Web3 client connectivity and basic operations"""

    def test_web3_client_init_without_credentials(self):
        """Should initialize in read-only mode without private key"""
        # Save existing env vars
        original_rpc = os.environ.get("DEX_RPC_URL")
        original_key = os.environ.get("DEX_PRIVATE_KEY")

        try:
            # Set test RPC (public Polygon endpoint)
            os.environ["DEX_RPC_URL"] = "https://polygon-rpc.com"
            if "DEX_PRIVATE_KEY" in os.environ:
                del os.environ["DEX_PRIVATE_KEY"]

            client = Web3Client()
            assert client.w3 is not None
            assert client.account is None  # No private key = read-only

        finally:
            # Restore env vars
            if original_rpc:
                os.environ["DEX_RPC_URL"] = original_rpc
            if original_key:
                os.environ["DEX_PRIVATE_KEY"] = original_key

    def test_web3_client_connection_check(self):
        """Should check blockchain connection"""
        os.environ["DEX_RPC_URL"] = "https://polygon-rpc.com"

        client = Web3Client()
        # May pass or fail depending on network availability
        # Just ensure method doesn't crash
        is_connected = client.is_connected()
        assert isinstance(is_connected, bool)


@pytest.mark.skipif(not WEB3_AVAILABLE, reason="Web3 not installed")
class TestDEXExecutor:
    """Test DEX executor with safety checks (dry-run mode)"""

    def test_dex_executor_dry_run_mode(self):
        """Should execute in dry-run mode without real transactions"""
        executor = DEXExecutor(dry_run=True)

        result = executor.execute_swap(
            token_in="0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",  # WMATIC
            token_out="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",  # USDC
            amount_in=Decimal("1.0"),
            expected_output=Decimal("1.5"),
            symbol="WMATIC",
        )

        assert result["status"] in ["dry_run", "simulated"]
        assert "amount_in" in result
        assert result["amount_in"] == "1.0"

    def test_slippage_calculation(self):
        """Should calculate minimum output with slippage protection"""
        executor = DEXExecutor(max_slippage_bps=100, dry_run=True)  # 1% max slippage

        expected_output_wei = 1_000_000  # 1 USDC (6 decimals)
        min_output_wei = executor._calculate_min_output(expected_output_wei, slippage_bps=50)

        # 50 bps = 0.5% slippage
        # Min output = 1_000_000 * (1 - 0.005) = 995_000
        assert min_output_wei == 995_000

    def test_slippage_exceeds_max(self):
        """Should reject swaps with excessive slippage"""
        executor = DEXExecutor(max_slippage_bps=100, dry_run=True)

        with pytest.raises(ValueError, match="exceeds max"):
            executor._calculate_min_output(1_000_000, slippage_bps=200)  # 2% > 1% max

    def test_daily_volume_limit_enforcement(self):
        """Should enforce daily volume limits per token"""
        executor = DEXExecutor(daily_volume_limit_usd=1000.0, dry_run=True)

        # First swap should succeed
        executor._check_daily_volume_limit(500.0, "WMATIC")

        # Second swap should succeed (total = 900)
        executor._check_daily_volume_limit(400.0, "WMATIC")

        # Third swap should fail (total would be 1100 > 1000)
        with pytest.raises(ValueError, match="Daily volume limit exceeded"):
            executor._check_daily_volume_limit(200.0, "WMATIC")

    def test_daily_volume_reset(self):
        """Should reset daily volume at midnight UTC"""
        executor = DEXExecutor(daily_volume_limit_usd=1000.0, dry_run=True)

        # Add volume
        executor._check_daily_volume_limit(900.0, "WMATIC")
        assert executor._daily_volume["WMATIC"] == 900.0

        # Manually trigger reset
        executor._last_reset_date = "2020-01-01"  # Old date
        executor._reset_daily_volume_if_needed()

        # Volume should be reset
        assert executor._daily_volume == {}

    def test_get_daily_volume_status(self):
        """Should return daily volume statistics"""
        executor = DEXExecutor(daily_volume_limit_usd=10000.0, dry_run=True)

        executor._check_daily_volume_limit(500.0, "WMATIC")
        executor._check_daily_volume_limit(300.0, "USDC")

        status = executor.get_daily_volume_status()

        assert status["limit_usd"] == 10000.0
        assert status["total_usd"] == 800.0
        assert status["remaining_usd"] == 9200.0
        assert "WMATIC" in status["volumes"]
        assert "USDC" in status["volumes"]

