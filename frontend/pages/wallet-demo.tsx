/**
 * Wallet Demo Page
 * Test page for blockchain wallet integration
 */

import { useAccount, useBalance, useSwitchChain } from "wagmi";
import { WalletButton } from "../components/wallet/WalletButton";
import { SUPPORTED_NETWORKS } from "../lib/wallet-provider";

export default function WalletDemo() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const { switchChain } = useSwitchChain();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Wallet Integration Demo</h1>
            <p className="text-slate-400">Testing wagmi + viem + RainbowKit integration</p>
          </div>
          <WalletButton />
        </div>

        {/* Connection Status */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Connection Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status:</span>
              <span
                className={`px-3 py-1 rounded-lg font-semibold ${
                  isConnected
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
            {isConnected && address && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Address:</span>
                  <span className="text-white font-mono text-sm">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Network:</span>
                  <span className="text-white font-semibold">{chain?.name || "Unknown"}</span>
                </div>
                {balance && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Balance:</span>
                    <span className="text-white font-semibold">
                      {parseFloat(balance.formatted).toFixed(6)} {balance.symbol}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Supported Networks */}
        {isConnected && (
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Supported Networks</h2>
            <div className="grid grid-cols-2 gap-4">
              {SUPPORTED_NETWORKS.map((network) => {
                const isActive = chain?.id === network.id;
                return (
                  <button
                    key={network.id}
                    onClick={() => switchChain?.({ chainId: network.id })}
                    disabled={isActive}
                    className={`p-4 rounded-lg border transition-all ${
                      isActive
                        ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                        : "bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500"
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-semibold mb-1">{network.name}</div>
                      <div className="text-xs opacity-70">Chain ID: {network.id}</div>
                      <div className="text-xs opacity-70 mt-1">{network.symbol}</div>
                    </div>
                    {isActive && (
                      <div className="text-xs mt-2 text-blue-400">✓ Currently Connected</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Instructions */}
        {!isConnected && (
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 mt-6">
            <h2 className="text-xl font-semibold text-white mb-4">Get Started</h2>
            <ol className="space-y-2 text-slate-300">
              <li>1. Click "Connect Wallet" button above</li>
              <li>2. Select your wallet provider (MetaMask, WalletConnect, etc.)</li>
              <li>3. Approve the connection in your wallet</li>
              <li>4. View your address, balance, and network info</li>
              <li>5. Switch between networks using the buttons below</li>
            </ol>
          </div>
        )}

        {/* Features */}
        <div className="mt-8 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Wallet Features ✅</h2>
          <ul className="space-y-2 text-slate-300">
            <li>✅ Multi-chain support (Ethereum, Polygon, BSC, Base)</li>
            <li>✅ Free RPC endpoints (zero monthly costs)</li>
            <li>✅ MetaMask + WalletConnect + Coinbase Wallet</li>
            <li>✅ Auto-connect on return visits</li>
            <li>✅ Beautiful RainbowKit UI with glassmorphism theme</li>
            <li>✅ Real-time balance & network display</li>
            <li>✅ Responsive design (mobile + desktop)</li>
            <li>✅ Network switching</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
