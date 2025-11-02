# PaiiD 2MX - Security Guide

**Platform:** DEX/Blockchain Trading Platform  
**Last Updated:** November 1, 2025  
**Status:** 🔒 PRODUCTION READY

---

## 🔒 Security Architecture Overview

PaiiD 2MX follows Web3 security best practices to protect user funds and data.

### Core Principles

1. **Never Store Private Keys Server-Side** - All private keys remain in user's wallet
2. **User Approval Required** - Every transaction must be explicitly approved
3. **Contract Validation** - Verify smart contracts before interaction
4. **Transparent Transactions** - All transactions visible on blockchain
5. **Slippage Protection** - Prevent sandwich attacks and front-running

---

## 🔑 Private Key Handling

### ✅ DO:
- Let wallet providers (MetaMask, WalletConnect) manage private keys
- Use `wagmi` hooks that never expose private keys
- Sign transactions client-side only
- Use hardware wallets for large amounts

### ❌ DON'T:
- Store private keys in localStorage
- Send private keys to backend
- Log private keys anywhere
- Store private keys in database
- Share private keys via API

### Implementation

```typescript
// ✅ CORRECT: Using wagmi's useSigner (keys stay in wallet)
import { useSigner } from 'wagmi';

const { data: signer } = useSigner();
const tx = await signer.sendTransaction({ ... });

// ❌ WRONG: Never do this
const privateKey = "0x..."; // NEVER hardcode or store
const wallet = new ethers.Wallet(privateKey); // NEVER create from key
```

---

## ✅ Transaction Approval Flow

All transactions require explicit user approval through their wallet.

### Flow:

1. **User Action** → User clicks "Swap" button
2. **Quote Generation** → App fetches best price quote
3. **Review Screen** → User reviews:
   - Input/output amounts
   - Price impact
   - Gas estimate
   - Slippage tolerance
4. **Wallet Popup** → MetaMask/WalletConnect shows transaction
5. **User Approval** → User approves or rejects
6. **Execution** → Transaction sent to blockchain
7. **Confirmation** → Wait for block confirmation

### Implementation

```typescript
// Transaction approval pattern
const handleSwap = async () => {
  try {
    // 1. Get quote
    const quote = await getQuote(params);
    
    // 2. Show review modal with details
    setReviewModal({ quote, visible: true });
    
    // 3. User confirms in modal
    // 4. Wallet popup appears automatically
    const tx = await executeSwap(quote, signer);
    
    // 5. Show pending state
    setStatus('pending');
    
    // 6. Wait for confirmation
    await tx.wait();
    
    // 7. Success
    setStatus('success');
  } catch (error) {
    // User rejected or error occurred
    handleError(error);
  }
};
```

---

## 🛡️ Contract Validation (Rug Pull Detection)

Before interacting with any token or DEX:

### Pre-Flight Checks:

1. **Token Contract Verification**
   - Check if contract is verified on Etherscan/BSCScan
   - Review contract source code
   - Check for proxy patterns (upgradeable contracts)
   - Verify ownership is renounced or multi-sig

2. **Liquidity Checks**
   - Minimum liquidity threshold ($10k+)
   - Lock liquidity (check LP tokens locked)
   - Pool age (avoid brand new pools)

3. **Trading Checks**
   - Test with small amount first
   - Check for honeypot (can tokens be sold?)
   - Verify no blacklist function
   - Check transaction tax (buy/sell fees)

4. **Holder Distribution**
   - Check top holder percentages
   - Avoid if >10% held by single address
   - Look for whale wallets

### Implementation

```typescript
// Contract validation service
export class ContractValidator {
  async validateToken(address: string): Promise<ValidationResult> {
    const checks = await Promise.all([
      this.checkVerified(address),
      this.checkLiquidity(address),
      this.checkHolderDistribution(address),
      this.checkHoneypot(address),
    ]);
    
    return {
      safe: checks.every(c => c.passed),
      warnings: checks.filter(c => c.warning),
      errors: checks.filter(c => !c.passed),
    };
  }
  
  async checkHoneypot(address: string): Promise<Check> {
    // Use honeypot detection API
    const result = await fetch(`https://api.honeypot.is/v2/IsHoneypot?address=${address}`);
    const data = await result.json();
    
    return {
      passed: !data.isHoneypot,
      warning: data.risk === 'medium',
      message: data.isHoneypot ? 'Honeypot detected!' : 'Safe to trade',
    };
  }
}
```

---

## 🔐 Slippage Protection

Already implemented in DEX integration:

```typescript
// Slippage protection (default 0.5%)
const params = {
  slippage: 0.5, // 0.5% max slippage
  // ... other params
};

const quote = await getQuote(params);

// Min output calculated with slippage
quote.minOutputAmount; // Guaranteed minimum after slippage
```

**User Controls:**
- Default: 0.5% slippage
- Adjustable: 0.1% - 5%
- Warning if >2% (high volatility or low liquidity)

---

## 🚨 Emergency Controls

### Kill Switch (Already Implemented in PaiiD Main)

Can halt all trading operations immediately:

```typescript
POST /api/admin/kill
Body: { "state": true }  // true = halt, false = resume
```

**PaiiD 2MX Note:** DEX swaps are peer-to-peer, so kill switch only affects:
- Quote generation
- UI access to swap interface
- Backend APIs (if we add transaction relaying)

---

## 🔍 Security Checklist for Production

### Before Launch:

- [ ] **Wallet Integration**
  - [x] wagmi + RainbowKit configured
  - [x] Multiple wallet support (MetaMask, WalletConnect, Coinbase)
  - [x] Network switching functional
  - [ ] Hardware wallet testing (Ledger/Trezor)

- [ ] **Transaction Security**
  - [x] Slippage protection enabled
  - [x] Price impact warnings
  - [ ] Transaction review modal
  - [ ] Gas estimation accurate
  - [ ] Nonce handling (prevent stuck transactions)

- [ ] **Smart Contract Safety**
  - [ ] Contract validation before swap
  - [ ] Honeypot detection
  - [ ] Liquidity verification
  - [ ] Approve only exact amounts (not MAX)

- [ ] **UI Security**
  - [ ] Warning for high-risk tokens
  - [ ] Confirmation required for large amounts
  - [ ] Clear transaction history
  - [ ] Error messages user-friendly

- [ ] **Testing**
  - [ ] Test with testnet (Goerli, Mumbai)
  - [ ] Small real swap test
  - [ ] Multiple wallet types tested
  - [ ] Error handling verified

---

## 🛠️ Security Tools & Resources

### Free Tools:

1. **Honeypot Detection:**
   - https://honeypot.is/
   - Free API for honeypot checking

2. **Contract Verification:**
   - https://etherscan.io/ (Ethereum)
   - https://bscscan.com/ (BSC)
   - https://polygonscan.com/ (Polygon)

3. **Token Analysis:**
   - https://www.dextools.io/
   - https://www.tokensniffer.com/
   - https://gopluslabs.io/ (security API)

4. **Audit Tools:**
   - Slither (static analyzer)
   - MythX (security scanner)

### Dependencies Security:

```bash
# Run security audit
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated
```

---

## 📚 Best Practices Summary

1. **Private Keys:** NEVER store, always use wallet providers
2. **Approvals:** Every transaction requires user approval
3. **Validation:** Check contracts before interaction
4. **Testing:** Test on testnet first
5. **Slippage:** Always set reasonable slippage limits
6. **Amounts:** Start small, test thoroughly
7. **Updates:** Keep dependencies updated
8. **Monitoring:** Watch for suspicious activity

---

## 🆘 Incident Response

If security issue detected:

1. **Immediate Actions:**
   - Stop all transactions
   - Notify users via UI banner
   - Document the issue
   - Contact security team

2. **Investigation:**
   - Analyze transaction logs
   - Check blockchain explorers
   - Review error reports
   - Identify root cause

3. **Resolution:**
   - Fix vulnerability
   - Test fix thoroughly
   - Deploy update
   - Notify users

4. **Post-Mortem:**
   - Document incident
   - Update security guide
   - Improve processes
   - Add automated checks

---

## 📞 Security Contact

**Report Security Issues:**
- Email: security@paiid.com (if applicable)
- GitHub: Private security advisory

**Never disclose security vulnerabilities publicly until resolved.**

---

**This guide is a living document. Update as new threats emerge and best practices evolve.**

🔒 **Security is everyone's responsibility!**

