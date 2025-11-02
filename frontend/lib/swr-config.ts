/**
 * SWR Configuration
 * Global configuration for SWR data fetching library
 */

import { SWRConfiguration } from "swr";

export const swrConfig: SWRConfiguration = {
  // Revalidate on focus - good for real-time data
  revalidateOnFocus: true,
  // Revalidate on reconnect
  revalidateOnReconnect: true,
  // Revalidate interval (5 seconds for market data)
  refreshInterval: 5000,
  // Dedupe requests made within 2 seconds
  dedupingInterval: 2000,
  // Error retry configuration
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  // Keep previous data while revalidating
  keepPreviousData: true,
  // Global fetcher
  fetcher: async (url: string) => {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN || ""}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = new Error(`API Error: ${response.status} ${response.statusText}`);
      (error as any).status = response.status;
      throw error;
    }

    return response.json();
  },
};

/**
 * SWR key factories for consistent cache keys
 */
export const swrKeys = {
  portfolio: {
    summary: () => "/api/proxy/portfolio/summary",
    history: (period: string) => `/api/proxy/portfolio/history?period=${period}`,
    positions: () => "/api/proxy/positions",
  },
  market: {
    quote: (symbol: string) => `/api/proxy/market/quote/${symbol}`,
    indices: (symbols: string[]) => `/api/proxy/api/market/indices?symbols=${symbols.join(",")}`,
  },
  analytics: {
    performance: (period: string) => `/api/proxy/analytics/performance?period=${period}`,
  },
  ai: {
    recommendations: () => "/api/proxy/ai/recommendations",
  },
  pnl: {
    track: (positionId: string) => `/api/pnl/track-position/${positionId}`,
    comparison: (positionId: string) => `/api/pnl/comparison/${positionId}`,
    portfolio: () => "/api/pnl/portfolio-summary",
  },
  strategies: {
    versions: (strategyId: string) => `/api/strategies/${strategyId}/versions`,
  },
  proposals: {
    list: (status?: string) => (status ? `/api/proposals?status=${status}` : "/api/proposals"),
  },
};

