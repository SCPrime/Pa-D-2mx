/**
 * Wallet Connection Button
 * Uses RainbowKit for beautiful wallet UI
 */

"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";

export function WalletButton() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });

  return (
    <div className="flex items-center gap-4">
      <ConnectButton
        accountStatus={{
          smallScreen: "avatar",
          largeScreen: "full",
        }}
        chainStatus="icon"
        showBalance={{
          smallScreen: false,
          largeScreen: true,
        }}
      />

      {isConnected && (
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-lg">
          <div className="flex flex-col text-xs">
            <span className="text-slate-400">Network</span>
            <span className="text-white font-semibold">{chain?.name || "Unknown"}</span>
          </div>
          {balance && (
            <div className="flex flex-col text-xs border-l border-slate-700 pl-2 ml-2">
              <span className="text-slate-400">Balance</span>
              <span className="text-white font-semibold">
                {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
