"""DEX meme coin strategy module stub."""

from __future__ import annotations

from collections.abc import Iterable

from ..base import MarketBootstrapResult, MarketContext, MarketStrategy
from ..registry import register_market_strategy


class DexMemeCoinStrategy(MarketStrategy):
    market_key = "dex_meme_coins"
    supported_modes = ("paper",)

    def bootstrap(self, context: MarketContext) -> MarketBootstrapResult:
        notes: Iterable[str] = (
            "TODO: connect to on-chain DEX data providers",
            "TODO: implement wallet signer abstraction",
        )
        services = {
            "price_oracle": "TODO: inject DEX price oracle service",
            "execution_router": "TODO: inject on-chain execution router",
        }
        return MarketBootstrapResult(
            services=services, background_tasks=("dex-stream",), notes=notes
        )

    def readiness_checks(self, context: MarketContext) -> Iterable[str]:
        return (
            "dex.rpc.health",
            "wallet.signer",
        )


register_market_strategy(DexMemeCoinStrategy.market_key, DexMemeCoinStrategy)
