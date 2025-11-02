/**
 * Trending Tokens Component
 * Displays hot/trending tokens from CoinGecko
 */

"use client";

import { useMarketData } from "../../hooks/useMarketData";

export function TrendingTokens() {
  const { trending, isLoading, error } = useMarketData();

  if (isLoading && trending.length === 0) {
    return (
      <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
        <p className="text-red-400 text-center">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          🔥 Trending Tokens
        </h2>
        <span className="text-xs text-slate-400">Updated every 5 min</span>
      </div>

      <div className="space-y-3">
        {trending.slice(0, 10).map((trending, index) => {
          const coin = trending.item;
          return (
            <div
              key={coin.id}
              className="flex items-center gap-3 p-3 bg-slate-900/30 hover:bg-slate-900/50 rounded-lg transition-colors cursor-pointer"
            >
              {/* Rank */}
              <div className="w-6 text-slate-400 text-sm font-semibold text-center">
                {index + 1}
              </div>

              {/* Icon */}
              <img src={coin.thumb} alt={coin.name} className="w-8 h-8 rounded-full" />

              {/* Token Info */}
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold truncate">{coin.name}</div>
                <div className="text-xs text-slate-400">{coin.symbol.toUpperCase()}</div>
              </div>

              {/* Market Cap Rank */}
              {coin.market_cap_rank && (
                <div className="text-xs text-slate-400">#{coin.market_cap_rank}</div>
              )}

              {/* Score */}
              <div className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                Score: {coin.score}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
