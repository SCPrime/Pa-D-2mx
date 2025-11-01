# ruff: noqa: I001
"""Simple registry for market strategy modules."""

from __future__ import annotations

from collections.abc import Callable, Iterable

from .base import MarketContext, MarketStrategy

MarketFactory = Callable[[], MarketStrategy]

_REGISTRY: dict[str, MarketFactory] = {}


def register_market_strategy(key: str, factory: MarketFactory) -> None:
    """Register or replace a market strategy factory."""

    _REGISTRY[key] = factory


def get_market_strategy(key: str) -> MarketStrategy:
    """Instantiate a strategy for the requested key."""

    try:
        factory = _REGISTRY[key]
    except KeyError as exc:  # pragma: no cover - guard for misuse
        available = ", ".join(sorted(_REGISTRY)) or "<none>"
        raise KeyError(
            f"No market strategy registered for '{key}'. Available: {available}"
        ) from exc
    return factory()


def list_market_keys() -> Iterable[str]:
    """Return registered market identifiers."""

    return tuple(sorted(_REGISTRY))


def bootstrap_market(context: MarketContext):
    """Convenience helper used by orchestrators."""

    strategy = get_market_strategy(context.market_key)
    if context.mode not in strategy.supported_modes:
        modes = ", ".join(strategy.supported_modes)
        raise ValueError(
            f"Mode '{context.mode}' not supported for {context.market_key}. "
            f"Expected one of: {modes}."
        )
    return strategy.bootstrap(context)
