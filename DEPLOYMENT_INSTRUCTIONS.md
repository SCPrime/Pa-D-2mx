# PaiiD-2mx Deployment Instructions

## Quick Deploy to Testnet

### Backend (Render)

1. **Create Render Account** (if not already):
   - Visit https://render.com
   - Sign up with GitHub

2. **Deploy Backend:**
   - Click "New +" → "Web Service"
   - Connect GitHub repo: `PaiiD-2mx`
   - Settings:
     - Name: `paiid-2mx-backend`
     - Region: Oregon
     - Branch: `main`
     - Root Directory: (leave blank)
     - Runtime: Python 3
     - Build Command: `cd backend && pip install -r requirements.txt`
     - Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Environment Variables:
     ```
     ENVIRONMENT=testnet
     ETHEREUM_RPC_URL=https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
     POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
     ALLOWED_ORIGINS=https://paiid-2mx.vercel.app,http://localhost:3000
     ```
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Note the URL: `https://paiid-2mx-backend.onrender.com`

### Frontend (Vercel)

1. **Create Vercel Account** (if not already):
   - Visit https://vercel.com
   - Sign up with GitHub

2. **Deploy Frontend:**
   - Click "Add New" → "Project"
   - Import `PaiiD-2mx` repo
   - Settings:
     - Framework: Next.js
     - Root Directory: `frontend`
     - Build Command: `npm run build` (auto-detected)
     - Output Directory: `.next` (auto-detected)
   - Environment Variables:
     ```
     NEXT_PUBLIC_DEX_BACKEND_URL=https://paiid-2mx-backend.onrender.com
     NEXT_PUBLIC_ENVIRONMENT=testnet
     ```
   - Click "Deploy"
   - Wait 2-3 minutes
   - Note the URL: `https://paiid-2mx.vercel.app`

### Test Deployment

1. **Visit Frontend:**
   - Go to: `https://paiid-2mx.vercel.app`
   - Should see login page
   - Login or connect wallet

2. **Test DEX Demo:**
   - Navigate to `/dex-demo`
   - Enter swap amount
   - Click "Get Quote"
   - Should see quote from 1inch API
   - Check console: No errors!

3. **Test Backend API:**
   - Visit: `https://paiid-2mx-backend.onrender.com/docs`
   - Should see FastAPI Swagger docs
   - Try GET `/dex/health` → should return `{"status": "healthy"}`

## Local Testing (Before Deployment)

### Terminal 1 - Backend
```bash
cd C:\Users\SSaint-Cyr\Documents\GitHub\PaiiD-2mx\backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Terminal 2 - Frontend  
```bash
cd C:\Users\SSaint-Cyr\Documents\GitHub\PaiiD-2mx\frontend
npm run dev
```

### Browser
- Visit: http://localhost:3000
- Should see login page
- Navigate to /dex-demo
- Test quote fetching

---

## Troubleshooting

### Backend won't start on Render
- Check logs in Render dashboard
- Verify all environment variables are set
- Check build command includes `cd backend`

### Frontend 404s
- Verify root directory is set to `frontend`
- Check build completed successfully
- Verify NEXT_PUBLIC_DEX_BACKEND_URL is set

### CORS errors
- Verify ALLOWED_ORIGINS includes Vercel URL
- Check frontend URL matches exactly
- Redeploy backend after changing CORS

### No quotes from 1inch
- Check backend logs for API errors
- Verify internet connectivity
- Check 1inch API status: https://status.1inch.io
- Test with different token pairs

---

## Estimated Costs

**Render (Backend):**
- Free tier: 750 hours/month
- Sufficient for testnet/demo

**Vercel (Frontend):**
- Free tier: 100GB bandwidth/month  
- Unlimited deployments

**Total: $0/month** ✅

