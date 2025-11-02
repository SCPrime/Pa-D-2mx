# PaiiD 2MX - DEX/Blockchain Trading Platform

**A decentralized exchange trading platform with blockchain wallet integration, multi-DEX aggregation, and real-time crypto market data.**

🔗 **Part of the PaiiD Trading Ecosystem**

---

## 🚀 Features

### ✅ Blockchain Wallet Integration
- Multi-wallet support (MetaMask, WalletConnect, Coinbase Wallet)
- Multi-chain (Ethereum, Polygon, BSC, Base)
- Auto-connect on return visits
- Real-time balance & network display
- Network switching
- **Tech:** wagmi + viem + RainbowKit

### ✅ DEX Protocol Integration
- Uniswap V3 SDK with AlphaRouter
- Multi-DEX aggregation (finds best prices)
- Real-time swap quotes
- Price impact calculation
- Slippage protection
- Gas estimation

### ✅ Meme Coin Market Data
- CoinGecko API integration (FREE tier, 50 calls/min)
- Real-time price updates (10s refresh)
- Trending tokens detection
- Token search
- Market cap, volume, 24h changes
- Built-in caching (1min)

### 🔒 Security
- Private keys never leave user's wallet
- Transaction approval required for all swaps
- Slippage protection built-in
- Comprehensive security guide
- Production-ready checklist

---

## 📊 Architecture

```
PaiiD-2mx/
├── frontend/
│   ├── components/
│   │   ├── wallet/          # Wallet UI components
│   │   ├── dex/             # DEX swap interface
│   │   └── market/          # Market data displays
│   ├── hooks/
│   │   ├── useWallet.ts     # Legacy wallet hook
│   │   ├── useDEX.ts        # DEX aggregation hook
│   │   └── useMarketData.ts # Market data hooks
│   ├── lib/
│   │   ├── dex/             # DEX protocol implementations
│   │   ├── market-data/     # CoinGecko client
│   │   └── wallet-provider.ts # Network configs
│   ├── contexts/
│   │   └── WalletContext.tsx # Main wallet provider
│   └── pages/
│       ├── wallet-demo.tsx  # Wallet integration demo
│       ├── dex-demo.tsx     # DEX swap demo
│       └── market-demo.tsx  # Market data demo
├── backend/                  # (Future: Optional backend services)
├── SECURITY_GUIDE.md        # Security best practices
├── PRODUCTION_CHECKLIST.md  # Deployment checklist
└── README.md                # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/PaiiD-2mx.git
cd PaiiD-2mx/frontend

# Install dependencies
npm install

# Set up environment variables (optional)
cp .env.example .env.local

# Start development server
npm run dev
```

Visit http://localhost:3000

### Demo Pages

- **Wallet Demo:** http://localhost:3000/wallet-demo
- **DEX Demo:** http://localhost:3000/dex-demo
- **Market Data Demo:** http://localhost:3000/market-demo

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js 14 (React 18)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Web3:**
  - wagmi v1 - React hooks for Ethereum
  - viem - TypeScript Ethereum library
  - RainbowKit - Wallet connection UI
- **DEX:**
  - @uniswap/v3-sdk - Uniswap V3 integration
  - @uniswap/smart-order-router - Best route finding
- **Market Data:**
  - CoinGecko API - Free crypto market data
- **State Management:** React hooks
- **Caching:** SWR patterns

### Infrastructure

- **RPC Providers:** Free public endpoints
  - Ethereum: eth.llamarpc.com
  - Polygon: polygon-rpc.com
  - BSC: bsc-dataseed1.binance.org
  - Base: mainnet.base.org
- **APIs:** CoinGecko (50 calls/min free)
- **Deployment:** Vercel/Render compatible

---

## 💰 Cost Structure

**Total Monthly Cost: $0** 🎉

All services use free tiers:
- ✅ RPC endpoints: Free public providers
- ✅ CoinGecko API: 50 calls/min free
- ✅ WalletConnect: Free tier (unlimited)
- ✅ Uniswap SDK: Open source, free
- ✅ wagmi/viem: Open source, free

---

## 📝 Usage Examples

### Connect Wallet

```tsx
import { WalletButton } from '@/components/wallet/WalletButton';

function Header() {
  return (
    <header>
      <WalletButton />
    </header>
  );
}
```

### Get Swap Quote

```tsx
import { useDEX } from '@/hooks/useDEX';
import { DEXProtocol, SwapType } from '@/lib/dex/dex-types';

function SwapComponent() {
  const { getBestQuote } = useDEX();
  
  const quote = await getBestQuote({
    protocol: DEXProtocol.UNISWAP_V3,
    tokenIn: WETH,
    tokenOut: USDC,
    amount: "1.0",
    swapType: SwapType.EXACT_INPUT,
    slippage: 0.5,
  });
  
  console.log(`Best price: ${quote.outputAmount.formatted} USDC`);
}
```

### Get Market Data

```tsx
import { useMarketData } from '@/hooks/useMarketData';

function MarketWidget() {
  const { tokens, trending } = useMarketData(['bitcoin', 'ethereum']);
  
  return (
    <div>
      {tokens.map(token => (
        <div key={token.id}>
          {token.name}: ${token.current_price}
        </div>
      ))}
    </div>
  );
}
```

---

## 🔒 Security

**CRITICAL:** Read [SECURITY_GUIDE.md](./SECURITY_GUIDE.md) before deploying to production.

### Key Security Principles:

1. **Private Keys:** Never stored server-side, always in user's wallet
2. **Approvals:** Every transaction requires explicit user approval
3. **Validation:** Smart contracts validated before interaction
4. **Slippage:** Protection against sandwich attacks
5. **Testing:** Thoroughly test on testnet first

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 📚 Documentation

- [Security Guide](./SECURITY_GUIDE.md) - Security best practices
- [Production Checklist](./PRODUCTION_CHECKLIST.md) - Deployment readiness
- [MOD SQUAD MAX Report](../PaiiD/MOD_SQUAD_MAX_CURSOR_CLAUDE_FINAL_REPORT.md) - Development summary

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📊 Project Status

**Current Status:** ✅ 100% Feature Complete (MVP)

### Completed (100%):
- ✅ Blockchain Wallet Integration
- ✅ DEX Protocol Integration  
- ✅ Market Data Integration
- ✅ Security Documentation

### Next Phase:
- Transaction review modal
- Contract validation service
- Comprehensive testing
- Production deployment

---

## 📄 License

Copyright © 2025 Dr. SC Prime. All Rights Reserved.

PROPRIETARY AND CONFIDENTIAL  
Unauthorized copying, modification, or distribution is strictly prohibited.

---

## 🆘 Support

- **Issues:** GitHub Issues
- **Documentation:** See docs in repository
- **Security:** See [SECURITY_GUIDE.md](./SECURITY_GUIDE.md)

---

## 🙏 Acknowledgments

- **Uniswap** - DEX protocol
- **RainbowKit** - Wallet UI
- **wagmi** - React hooks for Ethereum
- **CoinGecko** - Market data API
- **PaiiD Main** - Options trading platform sibling

---

## 🔗 Related Projects

- **PaiiD Main:** Stock & options trading platform (traditional markets)
- **PaiiD 2MX:** DEX & blockchain trading platform (crypto markets)

Both projects share design DNA and development practices while serving different markets.

---

**Built with ❤️ using MOD SQUAD MAX protocol**

🚀 **Where DREAM WORK comes from TEAM WORK!**
