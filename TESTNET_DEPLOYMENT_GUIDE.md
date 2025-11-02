# 🚀 PaiiD-2mx Testnet Deployment Guide

**Status:** READY TO DEPLOY  
**Target:** Testnet (Goerli + Mumbai)  
**Platform:** Render (Backend) + Vercel (Frontend)  
**Cost:** $0/month (Free tiers)

---

## 📋 QUICK START CHECKLIST

- [ ] **Step 1:** Create Render account
- [ ] **Step 2:** Create Vercel account  
- [ ] **Step 3:** Deploy backend to Render
- [ ] **Step 4:** Deploy frontend to Vercel
- [ ] **Step 5:** Test with MetaMask on testnet

**Estimated Time:** 30-40 minutes  
**Difficulty:** Easy (Click-based deployment)

---

## 🔧 STEP 1: BACKEND ENVIRONMENT VARIABLES

When deploying to Render, you'll need to set these environment variables in the Render dashboard:

### Required Variables

```bash
# Deployment Environment
ENVIRONMENT=production

# API Configuration (Render auto-sets PORT)
HOST=0.0.0.0
```

### Optional But Recommended

```bash
# 1inch API Key (Free tier - 100 req/sec)
# Get from: https://portal.1inch.dev/
ONEINCH_API_KEY=your_1inch_api_key_here

# Sentry Error Tracking (Free tier - 5k errors/month)
# Get from: https://sentry.io/
SENTRY_DSN=your_sentry_dsn_here

# CORS Origins (Update with your Vercel URL after Step 4)
ALLOWED_ORIGINS=https://paiid-2mx.vercel.app,http://localhost:3001
```

### Testnet RPC URLs (Free - Already configured in code)

```bash
# Ethereum Goerli
GOERLI_RPC_URL=https://rpc.ankr.com/eth_goerli

# Polygon Mumbai  
MUMBAI_RPC_URL=https://rpc.ankr.com/polygon_mumbai
```

---

## 🌐 STEP 2: RENDER DEPLOYMENT (Backend)

### 2.1 Create Render Account

1. Go to https://render.com
2. Sign up with GitHub (easiest for auto-deploy)
3. Authorize Render to access your GitHub repositories

### 2.2 Connect PaiiD-2mx Repository

1. Click "New +" → "Web Service"
2. Connect to GitHub → Select `PaiiD-2mx` repository
3. Render will automatically detect `render.yaml`!

### 2.3 Configure Web Service

Render should auto-fill these from `render.yaml`, but verify:

- **Name:** `paiid-2mx-backend`
- **Environment:** `Python 3`
- **Build Command:** `cd backend && pip install -r requirements.txt`
- **Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Plan:** `Free` (0.1 CPU, 512 MB RAM)

### 2.4 Add Environment Variables

Click "Environment" tab and add:

```
ENVIRONMENT = production
ONEINCH_API_KEY = (your key - optional)
SENTRY_DSN = (your DSN - optional)
ALLOWED_ORIGINS = (will add Vercel URL in Step 4)
```

### 2.5 Deploy!

1. Click "Create Web Service"
2. Wait 5-10 minutes for build + deployment
3. You'll get a URL like: `https://paiid-2mx-backend.onrender.com`

### 2.6 Verify Backend

Visit: `https://paiid-2mx-backend.onrender.com/health`

Should return:
```json
{
  "status": "healthy",
  "service": "PaiiD-2mx DEX API",
  "version": "1.0.0",
  "timestamp": "2025-11-02T17:30:00Z"
}
```

✅ **Backend is LIVE!**

---

## 🎨 STEP 3: VERCEL DEPLOYMENT (Frontend)

### 3.1 Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel to access repositories

### 3.2 Import PaiiD-2mx Project

1. Click "Add New" → "Project"
2. Select `PaiiD-2mx` repository
3. Vercel auto-detects Next.js!

### 3.3 Configure Build Settings

Should auto-fill, but verify:

- **Framework Preset:** `Next.js`
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

### 3.4 Add Environment Variables

Click "Environment Variables" and add:

```
NEXT_PUBLIC_DEX_BACKEND_URL = https://paiid-2mx-backend.onrender.com
```

### 3.5 Deploy!

1. Click "Deploy"
2. Wait 2-3 minutes for build
3. You'll get a URL like: `https://paiid-2mx.vercel.app`

### 3.6 Update Backend CORS

Go back to Render → Environment → Update `ALLOWED_ORIGINS`:

```
ALLOWED_ORIGINS=https://paiid-2mx.vercel.app,http://localhost:3001
```

Redeploy backend (takes 2 min)

✅ **Frontend is LIVE!**

---

## 🧪 STEP 4: TESTNET VALIDATION

### 4.1 Get Testnet Tokens

**Goerli ETH (Ethereum Testnet):**
- Faucet 1: https://goerlifaucet.com/
- Faucet 2: https://faucets.chain.link/goerli
- Amount needed: 0.1 ETH

**Mumbai MATIC (Polygon Testnet):**
- Faucet: https://faucet.polygon.technology/
- Amount needed: 1 MATIC

### 4.2 Configure MetaMask for Testnet

**Add Goerli Network:**
1. MetaMask → Networks → Add Network
2. Network Name: `Goerli`
3. RPC URL: `https://rpc.ankr.com/eth_goerli`
4. Chain ID: `5`
5. Currency Symbol: `ETH`

**Add Mumbai Network:**
1. MetaMask → Networks → Add Network
2. Network Name: `Mumbai`
3. RPC URL: `https://rpc.ankr.com/polygon_mumbai`
4. Chain ID: `80001`
5. Currency Symbol: `MATIC`

### 4.3 Test Wallet Connection

1. Visit: `https://paiid-2mx.vercel.app`
2. Click "Connect Wallet" (RainbowKit button)
3. Select MetaMask
4. Approve connection
5. ✅ Wallet should show as connected!

### 4.4 Test DEX Quote

1. Go to `/dex-demo` page
2. Select:
   - **From Token:** ETH
   - **To Token:** USDC
   - **Amount:** 0.01
   - **Network:** Goerli (Chain ID: 5)
3. Click "Get Quote"
4. Should see quote with:
   - Amount out
   - Price impact
   - Gas estimate
   - DEX source (Uniswap V3 or 1inch)

✅ **If quote appears, testnet is WORKING!**

### 4.5 Test Market Data

1. Go to `/market-demo` page
2. Should see trending tokens
3. Prices updating from CoinGecko
4. Click any token for details

✅ **Market data working!**

---

## 🐛 TROUBLESHOOTING

### Backend Issues

**Problem:** Backend health check fails  
**Solution:** Check Render logs → Environment → Verify all vars are set

**Problem:** CORS errors in browser console  
**Solution:** Update `ALLOWED_ORIGINS` in Render → Include Vercel URL

**Problem:** 1inch API rate limit  
**Solution:** Add `ONEINCH_API_KEY` in Render environment

### Frontend Issues

**Problem:** "Cannot connect to backend"  
**Solution:** Verify `NEXT_PUBLIC_DEX_BACKEND_URL` is correct in Vercel

**Problem:** Wallet won't connect  
**Solution:** Check MetaMask is on testnet (Goerli or Mumbai)

**Problem:** No quotes showing  
**Solution:** Check browser console → Verify backend /dex/quote endpoint is reachable

### MetaMask Issues

**Problem:** "Insufficient funds"  
**Solution:** Get more testnet tokens from faucets above

**Problem:** Network not found  
**Solution:** Manually add Goerli/Mumbai networks (see 4.2)

---

## 📊 MONITORING & OBSERVABILITY

### Render Logs

- Dashboard → Service → "Logs" tab
- Real-time logs of API calls
- Error tracking

### Sentry (if configured)

- Dashboard: https://sentry.io/
- Real-time error alerts
- Performance monitoring

### Vercel Logs

- Dashboard → Project → "Deployments" tab
- Build logs
- Runtime logs

---

## 🚀 NEXT STEPS AFTER TESTNET

### Phase 1: Extended Testing (1-2 days)
- [ ] Test all wallet connectors (MetaMask, WalletConnect, Coinbase)
- [ ] Test swaps on different testnets (Goerli, Mumbai)
- [ ] Load testing (simulate multiple users)
- [ ] Security audit (check for vulnerabilities)

### Phase 2: Mainnet Preparation (3-5 days)
- [ ] Audit all smart contract interactions
- [ ] Set up production Sentry project
- [ ] Configure Cloudflare for DDoS protection
- [ ] Set up backup RPC endpoints
- [ ] Implement swap execution (currently quote-only)

### Phase 3: Mainnet Launch (1 week)
- [ ] Deploy to mainnet
- [ ] Enable real trading
- [ ] Monitor for 24 hours
- [ ] Gradual rollout to users

---

## 💰 COST BREAKDOWN

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| **Render** | Free | $0 | 750 hrs/month, 512MB RAM |
| **Vercel** | Hobby | $0 | 100GB bandwidth, unlimited deployments |
| **1inch API** | Free | $0 | 100 req/sec |
| **Sentry** | Developer | $0 | 5,000 errors/month |
| **RPC Endpoints** | Public | $0 | Rate-limited but sufficient |

**Total Monthly Cost: $0** 🎉

---

## 📞 SUPPORT

### If You Get Stuck:

1. **Check Logs:** Render + Vercel dashboards
2. **Browser Console:** Press F12 → Console tab
3. **Network Tab:** F12 → Network → Look for failed requests
4. **Sentry:** Check for captured errors

### Quick Diagnostic URLs:

```
Backend Health: https://paiid-2mx-backend.onrender.com/health
Backend API Docs: https://paiid-2mx-backend.onrender.com/docs
Frontend: https://paiid-2mx.vercel.app
DEX Demo: https://paiid-2mx.vercel.app/dex-demo
```

---

## ✅ SUCCESS CRITERIA

**Testnet deployment is successful when:**

- [ ] Backend health check returns 200 OK
- [ ] Frontend loads without errors
- [ ] Wallet connects via RainbowKit
- [ ] DEX quote endpoint returns valid quote
- [ ] Market data displays correctly
- [ ] No CORS errors in browser console
- [ ] Sentry captures errors (if configured)

**Once all checked, you're LIVE on testnet!** 🎉🚀

---

**Ready to deploy? Let's go!** 💪

*Questions? Update MOD_SQUAD_LIVE_FEED.md and the team will assist!*

