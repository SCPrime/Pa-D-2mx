/**
 * Wallet Context Provider
 * Manages global wallet state using wagmi v2 + RainbowKit
 */

"use client";

import { RainbowKitProvider, darkTheme, getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { ReactNode } from "react";
import { WagmiProvider, http } from "wagmi";
import { base, bsc, mainnet, polygon } from "wagmi/chains";

// Create wagmi config using wagmi v2 + RainbowKit v2 API
const config = getDefaultConfig({
  appName: "PaiiD 2MX - DEX Trading Platform",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [mainnet, polygon, bsc, base],
  transports: {
    [mainnet.id]: http("https://eth.llamarpc.com"),
    [polygon.id]: http("https://polygon-rpc.com"),
    [bsc.id]: http("https://bsc-dataseed1.binance.org"),
    [base.id]: http("https://mainnet.base.org"),
  },
});

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider
        theme={darkTheme({
          accentColor: "#3b82f6", // Blue accent (matches PaiiD brand)
          accentColorForeground: "white",
          borderRadius: "medium",
          fontStack: "system",
          overlayBlur: "small",
        })}
        modalSize="compact"
      >
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}

export { config as wagmiConfig };
