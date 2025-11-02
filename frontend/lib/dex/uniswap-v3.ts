/**
 * Uniswap V3 Integration
 * Provides swap quotes and execution for Uniswap V3
 */

import { CurrencyAmount, Percent, TradeType, Token as UniToken } from "@uniswap/sdk-core";
import { AlphaRouter } from "@uniswap/smart-order-router";
import { ethers } from "ethers";
import { DEXProtocol, SwapParams, SwapQuote, SwapResult, SwapRoute, SwapType } from "./dex-types";

/**
 * Uniswap V3 Protocol Implementation
 */
export class UniswapV3Protocol {
  private router: AlphaRouter;
  private provider: ethers.providers.Provider;

  constructor(provider: ethers.providers.Provider, chainId: number) {
    this.provider = provider;
    this.router = new AlphaRouter({
      chainId,
      provider: this.provider as any,
    });
  }

  /**
   * Get swap quote from Uniswap V3
   */
  async getQuote(params: SwapParams): Promise<SwapQuote> {
    // Convert custom Token to Uniswap SDK Token
    const tokenIn = new UniToken(
      params.tokenIn.chainId,
      params.tokenIn.address,
      params.tokenIn.decimals,
      params.tokenIn.symbol,
      params.tokenIn.name
    );

    const tokenOut = new UniToken(
      params.tokenOut.chainId,
      params.tokenOut.address,
      params.tokenOut.decimals,
      params.tokenOut.symbol,
      params.tokenOut.name
    );

    // Parse amount
    const typedValueParsed = ethers.utils.parseUnits(
      params.amount,
      params.swapType === SwapType.EXACT_INPUT ? params.tokenIn.decimals : params.tokenOut.decimals
    );

    const currencyAmount = CurrencyAmount.fromRawAmount(
      params.swapType === SwapType.EXACT_INPUT ? tokenIn : tokenOut,
      typedValueParsed.toString()
    );

    // Get route from Alpha Router
    const route = await this.router.route(
      currencyAmount,
      params.swapType === SwapType.EXACT_INPUT ? tokenOut : tokenIn,
      params.swapType === SwapType.EXACT_INPUT ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT
    );

    if (!route) {
      throw new Error("No route found for swap");
    }

    // Parse route info
    const swapRoutes: SwapRoute[] = route.route.map((r: any) => ({
      protocol: DEXProtocol.UNISWAP_V3,
      pool: r.poolAddresses?.[0] || "unknown",
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      fee: r.pool?.fee || 3000,
      percentage: 100, // Single route for now
    }));

    // Calculate price impact
    const priceImpact = route.trade.priceImpact.toFixed(2);

    // Build quote
    const quote: SwapQuote = {
      protocol: DEXProtocol.UNISWAP_V3,
      inputAmount: {
        token: params.tokenIn,
        amount: route.trade.inputAmount.quotient.toString(),
        formatted: route.trade.inputAmount.toSignificant(6),
      },
      outputAmount: {
        token: params.tokenOut,
        amount: route.trade.outputAmount.quotient.toString(),
        formatted: route.trade.outputAmount.toSignificant(6),
      },
      route: swapRoutes,
      priceImpact,
      gasEstimate: route.estimatedGasUsed.toString(),
      slippage: params.slippage.toString(),
      minOutputAmount: {
        token: params.tokenOut,
        amount: route.trade
          .minimumAmountOut(new Percent(Math.floor(params.slippage * 100), 10000))
          .quotient.toString(),
        formatted: route.trade
          .minimumAmountOut(new Percent(Math.floor(params.slippage * 100), 10000))
          .toSignificant(6),
      },
      validUntil: Date.now() + 60 * 1000, // 1 minute
    };

    return quote;
  }

  /**
   * Execute swap on Uniswap V3
   */
  async executeSwap(_quote: SwapQuote, _signer: ethers.Signer): Promise<SwapResult> {
    // TODO: Implement actual swap execution
    // This requires calling the Uniswap V3 Router contract
    // For now, return a placeholder

    throw new Error("Swap execution not yet implemented. Use quote for price estimation.");

    // Example implementation (commented out):
    /*
    const swapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // Mainnet
    const swapRouter = new ethers.Contract(
      swapRouterAddress,
      SwapRouter.ABI,
      signer
    );

    const params = {
      tokenIn: quote.inputAmount.token.address,
      tokenOut: quote.outputAmount.token.address,
      fee: quote.route[0].fee,
      recipient: await signer.getAddress(),
      deadline: Math.floor(Date.now() / 1000) + 60 * 20,
      amountIn: quote.inputAmount.amount,
      amountOutMinimum: quote.minOutputAmount.amount,
      sqrtPriceLimitX96: 0,
    };

    const tx = await swapRouter.exactInputSingle(params);
    const receipt = await tx.wait();

    return {
      txHash: receipt.transactionHash,
      inputAmount: quote.inputAmount,
      outputAmount: quote.outputAmount,
      gasUsed: receipt.gasUsed.toString(),
      timestamp: Date.now(),
    };
    */
  }
}
