/**
 * Market Data Demo Page
 * Test page for crypto market data integration
 */

import { TrendingTokens } from "../components/market/TrendingTokens";
import { WalletButton } from "../components/wallet/WalletButton";
import { useMarketData, useTokenPrice } from "../hooks/useMarketData";

const POPULAR_TOKENS = ["bitcoin", "ethereum", "binancecoin", "solana", "cardano"];

export default function MarketDemo() {
  const { tokens, isLoading } = useMarketData(POPULAR_TOKENS);
  const { price: btcPrice, change24h: btcChange } = useTokenPrice("bitcoin");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Market Data Demo</h1>
            <p className="text-slate-400">Testing CoinGecko API integration (FREE tier)</p>
          </div>
          <WalletButton />
        </div>

        {/* Live BTC Price Ticker */}
        <div className="mb-8 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">₿</div>
              <div>
                <div className="text-white font-semibold text-lg">Bitcoin (BTC)</div>
                <div className="text-slate-400 text-sm">Live Price</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-3xl">
                $
                {btcPrice
                  ? btcPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "Loading..."}
              </div>
              {btcChange !== null && (
                <div
                  className={`text-lg font-semibold ${btcChange >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {btcChange >= 0 ? "+" : ""}
                  {btcChange.toFixed(2)}% (24h)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Tokens */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Popular Tokens</h2>
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
              {isLoading && tokens.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {tokens.map((token) => (
                    <div
                      key={token.id}
                      className="flex items-center gap-4 p-4 bg-slate-900/30 hover:bg-slate-900/50 rounded-lg transition-colors"
                    >
                      <img src={token.image} alt={token.name} className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <div className="text-white font-semibold">{token.name}</div>
                        <div className="text-xs text-slate-400">{token.symbol.toUpperCase()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          $
                          {token.current_price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 6,
                          })}
                        </div>
                        <div
                          className={`text-sm font-semibold ${token.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {token.price_change_percentage_24h >= 0 ? "+" : ""}
                          {token.price_change_percentage_24h.toFixed(2)}%
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">#{token.market_cap_rank}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Trending Tokens */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Trending Now</h2>
            <TrendingTokens />
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-white font-semibold text-lg mb-3">✅ Market Data Features</h3>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>✅ CoinGecko API integration</li>
              <li>✅ Real-time price updates</li>
              <li>✅ Trending tokens</li>
              <li>✅ Token search</li>
              <li>✅ Market cap & volume</li>
              <li>✅ 24h price changes</li>
            </ul>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-white font-semibold text-lg mb-3">🎯 React Hooks</h3>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>✅ useMarketData()</li>
              <li>✅ useToken()</li>
              <li>✅ useTokenPrice()</li>
              <li>✅ Auto-refresh intervals</li>
              <li>✅ Built-in caching</li>
              <li>✅ Error handling</li>
            </ul>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-white font-semibold text-lg mb-3">💰 Cost & Performance</h3>
            <div className="space-y-3">
              <div>
                <div className="text-3xl font-bold text-green-400">$0</div>
                <div className="text-sm text-slate-400">Monthly API costs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">50</div>
                <div className="text-sm text-slate-400">Calls/minute (free tier)</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">1min</div>
                <div className="text-sm text-slate-400">Cache duration</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
