# ruff: noqa: I001
"""PaiiD-2mx backend package."""

# Ensures market modules register themselves when app loads.
from . import markets

__all__ = ["markets"]
