/**
 * useDEX Hook
 * React hook for interacting with DEX backend API
 *
 * NOW USES BACKEND API - Browser compatible! No more AlphaRouter issues!
 */

import { useCallback, useState } from "react";
import { useAccount, useChainId } from "wagmi";

interface DEXQuote {
  dex: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  gasEstimate: number;
  priceImpact: number;
  route: string[];
}

interface UseDEXReturn {
  getQuote: (params: {
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    slippage?: number;
  }) => Promise<DEXQuote | null>;
  getBestQuote: (params: {
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    slippage?: number;
  }) => Promise<DEXQuote | null>;
  executeSwap: (params: {
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    recipient?: string;
    slippage?: number;
  }) => Promise<string | null>;
  isLoading: boolean;
  error: Error | null;
}

export function useDEX(): UseDEXReturn {
  const { address } = useAccount();
  const chainId = useChainId();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Backend API URL (from environment or default to localhost)
  const API_URL =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_DEX_BACKEND_URL || "http://localhost:8000"
      : "http://localhost:8000";

  /**
   * Get quote for a swap from backend API
   */
  const getQuote = useCallback(
    async (params: {
      tokenIn: string;
      tokenOut: string;
      amountIn: string;
      slippage?: number;
    }): Promise<DEXQuote | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          tokenIn: params.tokenIn,
          tokenOut: params.tokenOut,
          amountIn: params.amountIn,
          chainId: String(chainId || 1),
          slippage: String(params.slippage || 1.0),
        });

        const response = await fetch(`${API_URL}/dex/quote?${queryParams}`);

        if (!response.ok) {
          throw new Error(`Failed to get quote: ${response.statusText}`);
        }

        const quote: DEXQuote = await response.json();
        return quote;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error("Failed to get quote:", error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [chainId, API_URL]
  );

  /**
   * Get best quote from multiple DEXes (via 1inch)
   */
  const getBestQuote = useCallback(
    async (params: {
      tokenIn: string;
      tokenOut: string;
      amountIn: string;
      slippage?: number;
    }): Promise<DEXQuote | null> => {
      // 1inch already aggregates 50+ DEXes, so this is the same as getQuote
      return getQuote(params);
    },
    [getQuote]
  );

  /**
   * Execute a swap (placeholder - requires transaction building)
   */
  const executeSwap = useCallback(
    async (_params: {
      tokenIn: string;
      tokenOut: string;
      amountIn: string;
      recipient?: string;
      slippage?: number;
    }): Promise<string | null> => {
      if (!address) {
        setError(new Error("Wallet not connected"));
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        // TODO: Implement swap execution
        // Backend would need to return transaction data for user to sign
        console.log("Swap execution not yet implemented");
        throw new Error("Swap execution coming in next phase");
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error("Failed to execute swap:", error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [address]
  );

  return {
    getQuote,
    getBestQuote,
    executeSwap,
    isLoading,
    error,
  };
}
