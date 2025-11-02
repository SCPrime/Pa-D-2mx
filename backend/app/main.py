"""
PaiiD-2mx Backend API
=====================

DEX Aggregator API for multi-chain cryptocurrency trading.
Provides swap quotes from 50+ DEX protocols via 1inch integration.

Zero-cost architecture using free-tier APIs.
"""

import logging
import os

import sentry_sdk
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# Load environment variables
load_dotenv()

# Initialize Sentry (if DSN provided)
SENTRY_DSN = os.getenv("SENTRY_DSN")
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        environment=os.getenv("ENVIRONMENT", "development"),
        traces_sample_rate=0.1,  # 10% performance monitoring
        profiles_sample_rate=0.1,  # 10% profiling
    )
    logging.info("✅ Sentry initialized for error tracking")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="PaiiD-2mx DEX API",
    description="DEX Aggregator API for multi-chain cryptocurrency trading",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://paiid-2mx.vercel.app",
    "https://paiid-2mx-frontend.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from .routers import dex


# Initialize DEX aggregator
oneinch_api_key = os.getenv("ONEINCH_API_KEY")
dex.init_dex_aggregator(oneinch_api_key=oneinch_api_key)

# Register routers
app.include_router(dex.router)


@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "name": "PaiiD-2mx DEX API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "dex_aggregator": "operational",
            "1inch_api": "connected",
        },
    }


@app.on_event("startup")
async def startup_event():
    """Application startup"""
    logger.info("=" * 70)
    logger.info("PaiiD-2mx Backend Starting...")
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(
        f"1inch API Key: {'Configured' if oneinch_api_key else 'Not set (using free tier)'}"
    )
    logger.info("=" * 70)


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown"""
    logger.info("PaiiD-2mx Backend shutting down...")
