export type MarketProfile = "stocks-options" | "dex-spot";

export interface MarketProfileConfig {
  id: MarketProfile;
  features: {
    showGreeks: boolean;
    showSlippage: boolean;
    showGas: boolean;
    showExpiryPicker: boolean;
  };
}

const marketProfile: MarketProfileConfig = {
  id: "stocks-options",
  features: {
    showGreeks: true,
    showSlippage: false,
    showGas: false,
    showExpiryPicker: true,
  },
};

export default marketProfile;


