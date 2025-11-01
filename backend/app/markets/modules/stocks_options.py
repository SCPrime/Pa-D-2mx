"""Stocks/options strategy module stub."""

from __future__ import annotations

from collections.abc import Iterable

from ..base import MarketBootstrapResult, MarketContext, MarketStrategy
from ..registry import register_market_strategy


class StocksOptionsStrategy(MarketStrategy):
    market_key = "stocks_options"
    supported_modes = ("paper", "live")

    def bootstrap(self, context: MarketContext) -> MarketBootstrapResult:
        notes: Iterable[str] = (
            "TODO: wire Alpaca/Tradier live execution services",
            "TODO: connect options greeks calculators",
        )
        return MarketBootstrapResult(services={}, background_tasks=(), notes=notes)

    def readiness_checks(self, context: MarketContext) -> Iterable[str]:
        return (
            "broker.alpaca.paper" if context.mode == "paper" else "broker.alpaca.live",
            "marketdata.tradier.options",
        )


register_market_strategy(StocksOptionsStrategy.market_key, StocksOptionsStrategy)
