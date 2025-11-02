/**
 * Wallet Provider Setup
 * Configures Web3 provider for blockchain interactions
 */

export interface WalletConfig {
  networks: NetworkConfig[];
  defaultNetwork: number;
  rpcUrls: Record<number, string[]>;
}

export interface NetworkConfig {
  id: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  blockExplorer: string;
  testnet?: boolean;
}

// Supported networks for DEX trading
export const SUPPORTED_NETWORKS: NetworkConfig[] = [
  {
    id: 1,
    name: "Ethereum Mainnet",
    symbol: "ETH",
    rpcUrl: process.env.NEXT_PUBLIC_ETH_RPC_URL || "https://eth.llamarpc.com",
    blockExplorer: "https://etherscan.io",
  },
  {
    id: 137,
    name: "Polygon",
    symbol: "MATIC",
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
  },
  {
    id: 56,
    name: "BNB Smart Chain",
    symbol: "BNB",
    rpcUrl: process.env.NEXT_PUBLIC_BSC_RPC_URL || "https://bsc-dataseed1.binance.org",
    blockExplorer: "https://bscscan.com",
  },
  {
    id: 8453,
    name: "Base",
    symbol: "ETH",
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org",
    blockExplorer: "https://basescan.org",
  },
];

// Free RPC endpoints (no API key required)
export const FREE_RPC_ENDPOINTS: Record<number, string[]> = {
  1: ["https://eth.llamarpc.com", "https://rpc.ankr.com/eth", "https://ethereum.publicnode.com"],
  137: ["https://polygon-rpc.com", "https://rpc.ankr.com/polygon", "https://polygon.llamarpc.com"],
  56: [
    "https://bsc-dataseed1.binance.org",
    "https://rpc.ankr.com/bsc",
    "https://bsc.publicnode.com",
  ],
  8453: ["https://mainnet.base.org", "https://base.llamarpc.com"],
};

export const DEFAULT_NETWORK_ID = 137; // Polygon (low fees, fast)

export function getWalletConfig(): WalletConfig {
  return {
    networks: SUPPORTED_NETWORKS,
    defaultNetwork: DEFAULT_NETWORK_ID,
    rpcUrls: FREE_RPC_ENDPOINTS,
  };
}

export function getNetworkById(id: number): NetworkConfig | undefined {
  return SUPPORTED_NETWORKS.find((network) => network.id === id);
}

export function isNetworkSupported(id: number): boolean {
  return SUPPORTED_NETWORKS.some((network) => network.id === id);
}
