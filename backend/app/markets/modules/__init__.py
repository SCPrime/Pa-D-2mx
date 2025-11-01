"""Market modules ensure registration side-effects occur."""

from . import dex_meme_coins, stocks_options  # noqa: F401  (import for side effects)

__all__ = [
    "dex_meme_coins",
    "stocks_options",
]

