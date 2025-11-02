/**
 * PaiiD 2MX - DEX/Blockchain Trading Platform
 * Copyright © 2025 Dr. SC Prime. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useAccount } from "wagmi";
import LoginForm from "../components/auth/LoginForm";
import { WalletButton } from "../components/wallet/WalletButton";
import { useAuth } from "../hooks/useAuth";
import { logger } from "../lib/logger";

// Lazy load TrendingTokens (below fold, non-critical)
const TrendingTokens = dynamic(
  () => import("../components/market/TrendingTokens").then((mod) => ({ default: mod.TrendingTokens })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    ),
    ssr: false,
  }
);

export default function Home() {
  // === AUTHENTICATION CHECK - ENFORCES LOGIN ON LAUNCH ===
  const { user, isLoading: authLoading } = useAuth();
  const { isConnected } = useAccount();

  // Show loading during auth check
  if (authLoading) {
          return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading PaiiD 2MX...</p>
            </div>
        </div>
      );
    }

  // === LOGIN ENFORCEMENT - SHOW LOGIN PAGE IF NOT AUTHENTICATED ===
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome to PaiiD 2MX</h1>
            <p className="text-slate-400">DEX Trading Platform</p>
      </div>
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-8 shadow-2xl">
            <LoginForm
              onSuccess={() => {
                logger.info("[PaiiD-2mx] User logged in successfully");
              }}
              />
            </div>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">PaiiD 2MX</h1>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30">
              DEX Platform
                </span>
              </div>
          <WalletButton />
            </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">Decentralized Exchange Trading</h2>
          <p className="text-xl text-slate-300 mb-8">
            Trade crypto with multi-chain support, best price aggregation, and zero monthly costs.
          </p>
          {!isConnected && (
            <div className="flex justify-center">
              <WalletButton />
              </div>
            )}
          </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Link href="/wallet-demo">
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all cursor-pointer">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold text-white mb-2">Wallet Integration</h3>
              <p className="text-slate-400 text-sm mb-4">
                Connect MetaMask, WalletConnect, or Coinbase Wallet. Multi-chain support for ETH,
                Polygon, BSC, and Base.
              </p>
              <div className="text-blue-400 text-sm font-semibold">Try Demo →</div>
          </div>
          </Link>

          <Link href="/dex-demo">
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all cursor-pointer">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-white mb-2">DEX Swaps</h3>
              <p className="text-slate-400 text-sm mb-4">
                Get best prices from Uniswap V3. Multi-DEX aggregation finds optimal routes
                automatically.
              </p>
              <div className="text-blue-400 text-sm font-semibold">Try Demo →</div>
            </div>
          </Link>

          <Link href="/market-demo">
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all cursor-pointer">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">Market Data</h3>
              <p className="text-slate-400 text-sm mb-4">
                Real-time crypto prices and trending tokens powered by CoinGecko. Free tier with
                1-minute caching.
              </p>
              <div className="text-blue-400 text-sm font-semibold">Try Demo →</div>
            </div>
          </Link>
            </div>

        {/* Trending Tokens */}
        <div className="max-w-2xl mx-auto">
          <TrendingTokens />
              </div>
      </section>

      {/* Features List */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-700/50">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">🔒 Security First</h3>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>✅ Private keys never leave your wallet</li>
              <li>✅ Transaction approval required</li>
              <li>✅ Slippage protection built-in</li>
              <li>✅ Enterprise security guidelines</li>
            </ul>
            </div>

          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">💰 Zero Cost</h3>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>✅ Free RPC endpoints (4 chains)</li>
              <li>✅ CoinGecko free tier (50 calls/min)</li>
              <li>✅ WalletConnect free (unlimited)</li>
              <li>✅ Open source SDKs (Uniswap, wagmi)</li>
            </ul>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">⚡ Performance</h3>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>✅ Real-time quotes (&lt;1s)</li>
              <li>✅ Built-in caching (1min)</li>
              <li>✅ Multi-DEX aggregation</li>
              <li>✅ Auto-refresh market data</li>
            </ul>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">🎨 Beautiful UI</h3>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>✅ Glassmorphism design</li>
              <li>✅ Responsive (mobile + desktop)</li>
              <li>✅ RainbowKit wallet UI</li>
              <li>✅ Real-time updates</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 text-center text-slate-400 text-sm border-t border-slate-700/50">
        <p>© 2025 Dr. SC Prime. All Rights Reserved. | PaiiD 2MX - DEX Trading Platform</p>
      </footer>
    </div>
  );
}
