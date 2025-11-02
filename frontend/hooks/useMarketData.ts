/**
 * useMarketData Hook
 * React hook for fetching crypto market data
 */

import { useCallback, useEffect, useState } from "react";
import { coinGecko, CoinGeckoToken, TrendingCoin } from "../lib/market-data/coingecko";

interface UseMarketDataReturn {
  tokens: CoinGeckoToken[];
  trending: TrendingCoin[];
  isLoading: boolean;
  error: Error | null;
  refreshTokens: () => Promise<void>;
  refreshTrending: () => Promise<void>;
  searchTokens: (query: string) => Promise<any>;
}

export function useMarketData(tokenIds?: string[]): UseMarketDataReturn {
  const [tokens, setTokens] = useState<CoinGeckoToken[]>([]);
  const [trending, setTrending] = useState<TrendingCoin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch token market data
  const refreshTokens = useCallback(async () => {
    if (!tokenIds || tokenIds.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await coinGecko.getTokensMarketData(tokenIds);
      setTokens(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to fetch token data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [tokenIds]);

  // Fetch trending tokens
  const refreshTrending = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await coinGecko.getTrendingTokens();
      setTrending(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to fetch trending tokens:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search tokens
  const searchTokens = useCallback(async (query: string) => {
    if (!query) return [];

    try {
      const results = await coinGecko.searchTokens(query);
      return results;
    } catch (err) {
      console.error("Failed to search tokens:", err);
      return [];
    }
  }, []);

  // Auto-fetch on mount and when tokenIds change
  useEffect(() => {
    refreshTokens();
  }, [refreshTokens]);

  // Auto-fetch trending on mount
  useEffect(() => {
    refreshTrending();

    // Refresh trending every 5 minutes
    const interval = setInterval(refreshTrending, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshTrending]);

  return {
    tokens,
    trending,
    isLoading,
    error,
    refreshTokens,
    refreshTrending,
    searchTokens,
  };
}

/**
 * Hook for single token data
 */
export function useToken(tokenId: string) {
  const [token, setToken] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!tokenId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await coinGecko.getTokenDetails(tokenId);
      setToken(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error(`Failed to fetch token ${tokenId}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [tokenId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    token,
    isLoading,
    error,
    refresh,
  };
}

/**
 * Hook for token price with live updates
 */
export function useTokenPrice(tokenId: string, refreshInterval = 10000) {
  const [price, setPrice] = useState<number | null>(null);
  const [change24h, setChange24h] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPrice = async () => {
      if (!tokenId) return;

      setIsLoading(true);

      try {
        const data = await coinGecko.getSimplePrice([tokenId], ["usd"], true);
        if (data[tokenId]) {
          setPrice(data[tokenId].usd);
          setChange24h(data[tokenId].usd_24h_change);
        }
      } catch (err) {
        console.error(`Failed to fetch price for ${tokenId}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrice();

    // Auto-refresh at interval
    const interval = setInterval(fetchPrice, refreshInterval);
    return () => clearInterval(interval);
  }, [tokenId, refreshInterval]);

  return {
    price,
    change24h,
    isLoading,
  };
}
