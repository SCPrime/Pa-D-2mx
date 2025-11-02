/**
 * DEX Protocol Types
 * Common types for decentralized exchange integration
 */

export enum DEXProtocol {
  UNISWAP_V3 = "uniswap-v3",
  PANCAKESWAP_V3 = "pancakeswap-v3",
  SUSHISWAP = "sushiswap",
  CURVE = "curve",
}

export enum SwapType {
  EXACT_INPUT = "exact-input",
  EXACT_OUTPUT = "exact-output",
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  logoURI?: string;
}

export interface TokenAmount {
  token: Token;
  amount: string; // Raw amount (with decimals)
  formatted: string; // Human-readable (e.g., "1.5")
}

export interface SwapQuote {
  protocol: DEXProtocol;
  inputAmount: TokenAmount;
  outputAmount: TokenAmount;
  route: SwapRoute[];
  priceImpact: string; // Percentage (e.g., "0.05" = 0.05%)
  gasEstimate: string; // In gwei
  slippage: string; // Percentage (e.g., "0.5" = 0.5%)
  minOutputAmount: TokenAmount; // After slippage
  validUntil: number; // Unix timestamp
}

export interface SwapRoute {
  protocol: DEXProtocol;
  pool: string; // Pool address
  tokenIn: Token;
  tokenOut: Token;
  fee: number; // Fee in basis points (e.g., 3000 = 0.30%)
  percentage: number; // Percentage of trade going through this route
}

export interface SwapParams {
  protocol: DEXProtocol;
  tokenIn: Token;
  tokenOut: Token;
  amount: string;
  swapType: SwapType;
  slippage: number; // Percentage (e.g., 0.5 = 0.5%)
  recipient?: string; // Defaults to connected wallet
  deadline?: number; // Unix timestamp, defaults to 20 min from now
}

export interface SwapResult {
  txHash: string;
  inputAmount: TokenAmount;
  outputAmount: TokenAmount;
  gasUsed: string;
  timestamp: number;
}

export interface PoolInfo {
  protocol: DEXProtocol;
  address: string;
  token0: Token;
  token1: Token;
  fee: number; // Fee in basis points
  liquidity: string;
  volume24h: string;
  tvl: string; // Total Value Locked
}
