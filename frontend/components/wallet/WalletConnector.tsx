/**
 * WalletConnector Component
 * UI for connecting blockchain wallets (MetaMask, WalletConnect, Coinbase)
 */

import React, { useState } from "react";
import { useWallet } from "../../hooks/useWallet";
import EnhancedCard from "../ui/EnhancedCard";
import StatusIndicator from "../ui/StatusIndicator";

interface WalletConnectorProps {
  onConnect?: (address: string) => void;
  className?: string;
}

const WalletConnector: React.FC<WalletConnectorProps> = ({ onConnect, className = "" }) => {
  const { address, chainId, isConnected, isConnecting, error, balance, providers, connect, disconnect } =
    useWallet();

  const [showDetails, setShowDetails] = useState(false);

  const handleConnect = async () => {
    await connect();
    if (address && onConnect) {
      onConnect(address);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const getChainName = (id: number | null) => {
    const chains: Record<number, string> = {
      1: "Ethereum Mainnet",
      137: "Polygon",
      56: "BSC",
      42161: "Arbitrum",
      10: "Optimism",
      8453: "Base",
    };
    return id ? chains[id] || `Chain ${id}` : "Unknown";
  };

  if (isConnected && address) {
    return (
      <EnhancedCard variant="default" className={`p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIndicator status="online" size="sm" />
            <div>
              <p className="text-white font-semibold">{formatAddress(address)}</p>
              <p className="text-slate-400 text-sm">{getChainName(chainId)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {balance && (
              <div className="text-right">
                <p className="text-white font-semibold">{balance} ETH</p>
                <p className="text-slate-400 text-xs">Balance</p>
              </div>
            )}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
            >
              {showDetails ? "Hide" : "Details"}
            </button>
            <button
              onClick={disconnect}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Full Address</p>
                <p className="text-white font-mono text-xs break-all">{address}</p>
              </div>
              <div>
                <p className="text-slate-400">Chain ID</p>
                <p className="text-white">{chainId}</p>
              </div>
              <div>
                <p className="text-slate-400">Network</p>
                <p className="text-white">{getChainName(chainId)}</p>
              </div>
              <div>
                <p className="text-slate-400">Balance</p>
                <p className="text-white">{balance} ETH</p>
              </div>
            </div>
          </div>
        )}
      </EnhancedCard>
    );
  }

  return (
    <EnhancedCard variant="default" className={`p-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-white font-bold text-lg mb-2">Connect Wallet</h3>
        <p className="text-slate-400 mb-6 text-sm">
          Connect your wallet to access DEX trading features
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {providers.map((provider) => (
            <button
              key={provider.name}
              onClick={handleConnect}
              disabled={isConnecting || !provider.installed}
              className={`
                w-full px-6 py-3 rounded-lg font-semibold transition-all
                ${
                  provider.installed
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-slate-700 text-slate-400 cursor-not-allowed"
                }
                ${isConnecting ? "opacity-50 cursor-wait" : ""}
              `}
            >
              {isConnecting ? (
                <span className="flex items-center justify-center gap-2">
                  <StatusIndicator status="loading" size="sm" />
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {provider.name === "metamask" && "🦊 Connect MetaMask"}
                  {provider.name === "walletconnect" && "🔗 WalletConnect"}
                  {provider.name === "coinbase" && "💼 Coinbase Wallet"}
                  {!provider.installed && " (Not Installed)"}
                </span>
              )}
            </button>
          ))}
        </div>

        <p className="text-slate-500 text-xs mt-4">
          By connecting your wallet, you agree to the Terms of Service
        </p>
      </div>
    </EnhancedCard>
  );
};

export default WalletConnector;


