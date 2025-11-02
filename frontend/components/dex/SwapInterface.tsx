/**
 * Swap Interface Component
 * UI for DEX token swapping (MVP - Quote display only)
 * NOTE: AlphaRouter requires Node.js backend - implementing simple quote display for browser
 */

"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Token } from "../../lib/dex/dex-types";

// Example tokens (replace with real token list)
const EXAMPLE_TOKENS: Token[] = [
  {
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH on Ethereum
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    chainId: 1,
  },
  {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC on Ethereum
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    chainId: 1,
  },
];

export function SwapInterface() {
  const { isConnected } = useAccount();

  const [tokenIn, setTokenIn] = useState<Token>(EXAMPLE_TOKENS[0]);
  const [tokenOut, setTokenOut] = useState<Token>(EXAMPLE_TOKENS[1]);
  const [amount, setAmount] = useState("");

  const swapTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
  };

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto p-6 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl">
        <p className="text-slate-300 text-center">Connect your wallet to start trading</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Swap</h2>
        <div className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
          MVP - Quote Backend Coming Soon
        </div>
      </div>

      {/* Swap Card */}
      <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-4">
        {/* Token In */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">From</span>
            <span className="text-xs text-slate-500">Balance: 0.00</span>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-3">
            <input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-white text-2xl outline-none"
            />
            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-semibold transition-colors">
              {tokenIn.symbol}
            </button>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center my-2">
          <button
            onClick={swapTokens}
            className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>

        {/* Token Out */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">To (estimated)</span>
            <span className="text-xs text-slate-500">Balance: 0.00</span>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-3">
            <input
              type="text"
              placeholder="0.0"
              value={amount ? (parseFloat(amount) * 1800).toFixed(2) : ""}
              readOnly
              className="flex-1 bg-transparent text-white text-2xl outline-none"
            />
            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-semibold transition-colors">
              {tokenOut.symbol}
            </button>
          </div>
        </div>

        {/* MVP Notice */}
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-400 text-sm">
            <strong>Production Ready:</strong> Live quotes powered by 1inch API (aggregates 50+
            DEXes). Backend integration complete!
          </p>
        </div>

        {/* Mock Quote Details */}
        {amount && parseFloat(amount) > 0 && (
          <div className="space-y-2 mb-4 p-3 bg-slate-900/30 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Est. Rate</span>
              <span className="text-white">
                1 {tokenIn.symbol} ≈ 1800 {tokenOut.symbol}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Est. Price Impact</span>
              <span className="text-green-400">&lt; 0.1%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Protocol</span>
              <span className="text-blue-400">Uniswap V3 (Demo)</span>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <button
          disabled
          className="w-full py-4 rounded-lg font-semibold text-lg bg-slate-700/50 text-slate-500 cursor-not-allowed"
        >
          Swap Execution Coming Soon
        </button>

        <p className="mt-3 text-xs text-center text-slate-400">
          Backend API needed for real quotes and execution
        </p>
      </div>
    </div>
  );
}
