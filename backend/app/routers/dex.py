"""
DEX Router - Swap Quote Endpoints
==================================

Provides quote aggregation across multiple DEXes via 1inch API.
"""

import logging

from fastapi import APIRouter, HTTPException, Query

from ..services.dex_aggregator import DEXAggregator


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/dex", tags=["dex"])

# Initialize aggregator (will be configured in main.py)
aggregator: DEXAggregator | None = None


def init_dex_aggregator(oneinch_api_key: str | None = None):
    """Initialize DEX aggregator service"""
    global aggregator
    aggregator = DEXAggregator(oneinch_api_key=oneinch_api_key)
    logger.info("DEX aggregator initialized")


@router.get("/quote")
async def get_quote(
    tokenIn: str = Query(..., description="Input token address"),
    tokenOut: str = Query(..., description="Output token address"),
    amountIn: str = Query(..., description="Input amount in wei"),
    chainId: int = Query(1, description="Chain ID (1=Ethereum, 137=Polygon, etc.)"),
    slippage: float = Query(
        1.0, description="Max slippage tolerance in %", ge=0.1, le=50.0
    ),
):
    """
    Get best swap quote across all DEX aggregators

    Uses 1inch API to aggregate quotes from 50+ DEX protocols.

    Example:
        GET /dex/quote?tokenIn=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&tokenOut=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&amountIn=1000000000000000000&chainId=1

    Returns:
        Best quote with dex name, amounts, gas estimate, route
    """
    if not aggregator:
        raise HTTPException(status_code=500, detail="DEX aggregator not initialized")

    try:
        amount_in_int = int(amountIn)
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Invalid amountIn: must be integer in wei"
        )

    logger.info(
        f"Quote request: {tokenIn} → {tokenOut}, amount: {amount_in_int}, chain: {chainId}"
    )

    quote = aggregator.get_best_quote(
        token_in=tokenIn,
        token_out=tokenOut,
        amount_in=amount_in_int,
        chain_id=chainId,
        slippage=slippage,
    )

    if not quote:
        raise HTTPException(
            status_code=503, detail="Unable to get quote from any DEX. Try again later."
        )

    return quote.to_dict()


@router.get("/quote/1inch")
async def get_quote_1inch_only(
    tokenIn: str = Query(...),
    tokenOut: str = Query(...),
    amountIn: str = Query(...),
    chainId: int = Query(1),
    slippage: float = Query(1.0),
):
    """Get quote from 1inch only (for testing/debugging)"""
    if not aggregator:
        raise HTTPException(status_code=500, detail="DEX aggregator not initialized")

    try:
        amount_in_int = int(amountIn)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid amountIn")

    quote = aggregator.get_quote_1inch(
        tokenIn, tokenOut, amount_in_int, chainId, slippage
    )

    if not quote:
        raise HTTPException(status_code=503, detail="1inch API unavailable")

    return quote.to_dict()


@router.get("/health")
async def dex_health():
    """Check DEX aggregator health"""
    if not aggregator:
        return {"status": "not_initialized"}

    return {
        "status": "healthy",
        "supported_chains": list(DEXAggregator.SUPPORTED_CHAINS.keys()),
        "dex_sources": ["1inch (50+ DEXes)", "Uniswap V3"],
    }
