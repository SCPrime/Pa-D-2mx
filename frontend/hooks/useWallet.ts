/**
 * useWallet Hook
 * Blockchain wallet connection and management (MetaMask, WalletConnect)
 */

import { useCallback, useEffect, useState } from "react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  balance: string | null;
}

export interface WalletProvider {
  name: "metamask" | "walletconnect" | "coinbase";
  installed: boolean;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    balance: null,
  });

  const [providers, setProviders] = useState<WalletProvider[]>([]);

  // Check available wallet providers
  useEffect(() => {
    const availableProviders: WalletProvider[] = [];

    // Check MetaMask
    if (typeof window !== "undefined" && window.ethereum?.isMetaMask) {
      availableProviders.push({ name: "metamask", installed: true });
    }

    // Check Coinbase Wallet
    if (typeof window !== "undefined" && window.ethereum?.isCoinbaseWallet) {
      availableProviders.push({ name: "coinbase", installed: true });
    }

    // WalletConnect is always available (doesn't require extension)
    availableProviders.push({ name: "walletconnect", installed: true });

    setProviders(availableProviders);
  }, []);

  // Connect to MetaMask
  const connectMetaMask = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setState((prev) => ({
        ...prev,
        error: "MetaMask not installed. Please install MetaMask extension.",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // Get chain ID
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      // Get balance
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [accounts[0], "latest"],
      });

      // Convert hex balance to ETH
      const balanceInEth = parseInt(balance, 16) / 1e18;

      setState({
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        isConnected: true,
        isConnecting: false,
        error: null,
        balance: balanceInEth.toFixed(4),
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error.message || "Failed to connect to MetaMask",
      }));
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setState({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      balance: null,
    });
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        disconnect();
      } else {
        // User switched accounts
        setState((prev) => ({ ...prev, address: accounts[0] }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      setState((prev) => ({ ...prev, chainId: parseInt(chainId, 16) }));
      // Reload page on chain change (recommended by MetaMask)
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [disconnect]);

  // Switch network
  const switchNetwork = useCallback(async (chainId: number) => {
    if (typeof window === "undefined" || !window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // Chain not added to MetaMask
      if (error.code === 4902) {
        setState((prev) => ({
          ...prev,
          error: `Chain ${chainId} not added to wallet. Please add it manually.`,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: error.message || "Failed to switch network",
        }));
      }
    }
  }, []);

  // Sign message
  const signMessage = useCallback(
    async (message: string): Promise<string | null> => {
      if (!state.address || !window.ethereum) {
        setState((prev) => ({ ...prev, error: "Wallet not connected" }));
        return null;
      }

      try {
        const signature = await window.ethereum.request({
          method: "personal_sign",
          params: [message, state.address],
        });
        return signature;
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.message || "Failed to sign message",
        }));
        return null;
      }
    },
    [state.address]
  );

  return {
    ...state,
    providers,
    connect: connectMetaMask,
    disconnect,
    switchNetwork,
    signMessage,
  };
}


