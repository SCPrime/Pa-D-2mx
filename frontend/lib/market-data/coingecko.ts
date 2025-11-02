/**
 * CoinGecko API Integration
 * Free public API for cryptocurrency market data
 * No API key required for basic usage (50 calls/min)
 */

export interface CoinGeckoToken {
  id: string; // coingecko id (e.g., "bitcoin")
  symbol: string; // ticker (e.g., "BTC")
  name: string; // full name (e.g., "Bitcoin")
  image: string; // logo URL
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number; // all-time high
  ath_change_percentage: number;
  ath_date: string;
  atl: number; // all-time low
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

export interface TrendingCoin {
  item: {
    id: string;
    coin_id: number;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    small: string;
    large: string;
    slug: string;
    price_btc: number;
    score: number;
  };
}

/**
 * CoinGecko API Client
 * Free tier: 50 calls/minute
 */
export class CoinGeckoClient {
  private baseURL = "https://api.coingecko.com/api/v3";
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheDuration = 60 * 1000; // 1 minute

  /**
   * Get market data for specific tokens
   */
  async getTokensMarketData(tokenIds: string[], vsCurrency = "usd"): Promise<CoinGeckoToken[]> {
    const cacheKey = `markets-${tokenIds.join(",")}-${vsCurrency}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    const url = `${this.baseURL}/coins/markets?vs_currency=${vsCurrency}&ids=${tokenIds.join(",")}&order=market_cap_desc&sparkline=false`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache result
    this.cache.set(cacheKey, { data, timestamp: Date.now() });

    return data;
  }

  /**
   * Get trending/hot tokens
   */
  async getTrendingTokens(): Promise<TrendingCoin[]> {
    const cacheKey = "trending";

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    const url = `${this.baseURL}/search/trending`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache result
    this.cache.set(cacheKey, { data: data.coins, timestamp: Date.now() });

    return data.coins;
  }

  /**
   * Search for tokens
   */
  async searchTokens(query: string): Promise<any> {
    const url = `${this.baseURL}/search?query=${encodeURIComponent(query)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.coins;
  }

  /**
   * Get token details by ID
   */
  async getTokenDetails(tokenId: string): Promise<any> {
    const cacheKey = `token-${tokenId}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    const url = `${this.baseURL}/coins/${tokenId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache result
    this.cache.set(cacheKey, { data, timestamp: Date.now() });

    return data;
  }

  /**
   * Get simple price for token(s)
   */
  async getSimplePrice(
    tokenIds: string[],
    vsCurrencies = ["usd"],
    includeChange = true
  ): Promise<Record<string, any>> {
    const url = `${this.baseURL}/simple/price?ids=${tokenIds.join(",")}&vs_currencies=${vsCurrencies.join(",")}&include_24hr_change=${includeChange}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Clear cache (useful for forcing refresh)
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const coinGecko = new CoinGeckoClient();
