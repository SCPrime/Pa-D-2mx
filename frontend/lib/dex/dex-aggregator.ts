/**
 * DEX Aggregator
 * Abstracts multiple DEX protocols into a unified interface
 * Automatically finds best quotes across all supported DEXes
 */

import { ethers } from "ethers";
import { DEXProtocol, SwapParams, SwapQuote, SwapResult } from "./dex-types";
import { UniswapV3Protocol } from "./uniswap-v3";

/**
 * DEX Aggregator - finds best prices across multiple DEXes
 */
export class DEXAggregator {
  private protocols: Map<DEXProtocol, any>;

  constructor(provider: ethers.providers.Provider, chainId: number) {
    this.protocols = new Map();

    // Initialize supported protocols
    this.protocols.set(DEXProtocol.UNISWAP_V3, new UniswapV3Protocol(provider, chainId));

    // TODO: Add more protocols
    // this.protocols.set(DEXProtocol.PANCAKESWAP_V3, new PancakeSwapV3Protocol(provider, chainId));
    // this.protocols.set(DEXProtocol.SUSHISWAP, new SushiSwapProtocol(provider, chainId));
  }

  /**
   * Get quotes from all supported DEXes and return the best one
   */
  async getBestQuote(params: SwapParams): Promise<SwapQuote> {
    // Query all protocols in parallel
    const quotePromises = Array.from(this.protocols.entries()).map(async ([protocol, impl]) => {
      try {
        const quote = await impl.getQuote({ ...params, protocol });
        return quote;
      } catch (error) {
        console.error(`Failed to get quote from ${protocol}:`, error);
        return null;
      }
    });

    const results = await Promise.all(quotePromises);
    const validQuotes = results.filter((q): q is SwapQuote => q !== null);

    if (validQuotes.length === 0) {
      throw new Error("No valid quotes found from any DEX");
    }

    // Find best quote (highest output amount)
    const bestQuote = validQuotes.reduce((best, current) => {
      const bestOutput = parseFloat(best.outputAmount.formatted);
      const currentOutput = parseFloat(current.outputAmount.formatted);
      return currentOutput > bestOutput ? current : best;
    });

    return bestQuote;
  }

  /**
   * Get quotes from a specific protocol
   */
  async getQuote(params: SwapParams): Promise<SwapQuote> {
    const protocol = this.protocols.get(params.protocol);
    if (!protocol) {
      throw new Error(`Unsupported protocol: ${params.protocol}`);
    }

    return protocol.getQuote(params);
  }

  /**
   * Execute swap on the specified protocol
   */
  async executeSwap(quote: SwapQuote, signer: ethers.Signer): Promise<SwapResult> {
    const protocol = this.protocols.get(quote.protocol);
    if (!protocol) {
      throw new Error(`Unsupported protocol: ${quote.protocol}`);
    }

    return protocol.executeSwap(quote, signer);
  }

  /**
   * Get list of supported protocols for current chain
   */
  getSupportedProtocols(): DEXProtocol[] {
    return Array.from(this.protocols.keys());
  }

  /**
   * Check if protocol is supported on current chain
   */
  isProtocolSupported(protocol: DEXProtocol): boolean {
    return this.protocols.has(protocol);
  }
}

/**
 * Factory function to create DEX Aggregator
 */
export function createDEXAggregator(
  provider: ethers.providers.Provider,
  chainId: number
): DEXAggregator {
  return new DEXAggregator(provider, chainId);
}
