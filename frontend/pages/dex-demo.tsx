/**
 * DEX Demo Page
 * Test page for DEX swap functionality
 */

import { SwapInterface } from "../components/dex/SwapInterface";
import { WalletButton } from "../components/wallet/WalletButton";

export default function DEXDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">DEX Swap Demo</h1>
            <p className="text-slate-400">
              Testing Uniswap V3 integration with best price aggregation
            </p>
          </div>
          <WalletButton />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Swap Interface */}
          <div>
            <SwapInterface />
          </div>

          {/* Features & Info */}
          <div className="space-y-6">
            {/* DEX Features */}
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">DEX Integration Features ✅</h2>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>✅ Uniswap V3 SDK integration</li>
                <li>✅ AlphaRouter for best routing</li>
                <li>✅ Multi-DEX aggregation layer</li>
                <li>✅ Real-time quote fetching</li>
                <li>✅ Price impact calculation</li>
                <li>✅ Slippage protection</li>
                <li>✅ Gas estimation</li>
                <li>✅ React hooks (useDEX)</li>
                <li>✅ Protocol abstraction</li>
                <li>✅ Error handling & loading states</li>
              </ul>
            </div>

            {/* How It Works */}
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">How It Works</h2>
              <ol className="space-y-3 text-slate-300 text-sm">
                <li>
                  <span className="text-blue-400 font-semibold">1. Connect Wallet</span>
                  <p className="text-slate-400 mt-1">
                    Connect MetaMask or any Web3 wallet using WalletConnect
                  </p>
                </li>
                <li>
                  <span className="text-blue-400 font-semibold">2. Select Tokens</span>
                  <p className="text-slate-400 mt-1">
                    Choose input and output tokens from supported list
                  </p>
                </li>
                <li>
                  <span className="text-blue-400 font-semibold">3. Enter Amount</span>
                  <p className="text-slate-400 mt-1">
                    Input amount triggers live quote fetching from Uniswap V3
                  </p>
                </li>
                <li>
                  <span className="text-blue-400 font-semibold">4. Review Quote</span>
                  <p className="text-slate-400 mt-1">
                    Check rate, price impact, min. received, and protocol
                  </p>
                </li>
                <li>
                  <span className="text-blue-400 font-semibold">5. Execute Swap</span>
                  <p className="text-slate-400 mt-1">
                    Approve token spending and execute swap (coming soon!)
                  </p>
                </li>
              </ol>
            </div>

            {/* Supported Protocols */}
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Supported Protocols</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-pink-400 text-xl">🦄</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">Uniswap V3</div>
                      <div className="text-xs text-slate-400">Ethereum, Polygon, etc.</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-400 text-xl">🥞</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">PancakeSwap</div>
                      <div className="text-xs text-slate-400">BSC, Ethereum</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-600/50 text-slate-400 text-xs rounded-full">
                    Coming Soon
                  </span>
                </div>

                <div className="flex items-center justify-between opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 text-xl">🍣</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">SushiSwap</div>
                      <div className="text-xs text-slate-400">Multi-chain</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-600/50 text-slate-400 text-xs rounded-full">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>

            {/* Cost & Performance */}
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Cost & Performance</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-bold text-green-400">$0</div>
                  <div className="text-sm text-slate-400">Monthly API costs</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-400">&lt;1s</div>
                  <div className="text-sm text-slate-400">Quote fetch time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
