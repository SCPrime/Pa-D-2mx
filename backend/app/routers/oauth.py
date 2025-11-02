"""
OAuth 2.0 Authentication Router
================================

Handles social login (Google, Apple) via OAuth 2.0.
Creates or links user accounts and returns JWT tokens.

Endpoints:
- GET /auth/google/login - Initiate Google OAuth flow
- GET /auth/google/callback - Handle Google OAuth callback
- GET /auth/apple/login - Initiate Apple OAuth flow
- GET /auth/apple/callback - Handle Apple OAuth callback
"""

from datetime import UTC, datetime

from authlib.integrations.starlette_client import OAuth, OAuthError
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.jwt import create_token_pair
from ..core.logging_utils import get_secure_logger
from ..db.session import get_db
from ..models.database import ActivityLog, User
from ..schemas.auth import TokenResponse


logger = get_secure_logger(__name__)
router = APIRouter(tags=["OAuth"])

# Initialize OAuth client
oauth = OAuth()

# Register Google OAuth provider
oauth.register(
    name="google",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

# Register Apple OAuth provider
oauth.register(
    name="apple",
    client_id=settings.APPLE_CLIENT_ID,
    client_secret=settings.APPLE_CLIENT_SECRET,  # JWT signed with private key
    server_metadata_url="https://appleid.apple.com/.well-known/openid-configuration",
    client_kwargs={"scope": "name email"},
)


@router.get("/auth/google/login")
async def google_login(request: Request):
    """
    Initiate Google OAuth flow

    Redirects user to Google sign-in page.
    After authentication, Google redirects back to /auth/google/callback.
    """
    # Build callback URL (must match Google Console redirect URI)
    redirect_uri = str(request.url_for("google_callback"))

    logger.info("🔐 Initiating Google OAuth flow", extra={"redirect_uri": redirect_uri})

    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/auth/google/callback", response_model=TokenResponse)
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """
    Handle Google OAuth callback

    Exchanges authorization code for user info,
    creates or links user account, and returns JWT tokens.

    Returns:
    - Access token (15min expiry)
    - Refresh token (7 days expiry)

    Errors:
    - 500: OAuth exchange failed
    """
    try:
        # Exchange authorization code for access token
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get("userinfo")

        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get user info from Google",
            )

        email = user_info.get("email")
        full_name = user_info.get("name", "")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No email provided by Google",
            )

        logger.info(f"✅ Google OAuth successful for: {email}")

        # Find or create user
        user = db.query(User).filter(User.email == email).first()

        if user:
            # Existing user - log them in
            logger.info(f"🔑 Existing user logging in via Google: {email}")
            user.last_login_at = datetime.now(UTC)
        else:
            # New user - create account
            logger.info(f"🆕 Creating new user from Google OAuth: {email}")
            user = User(
                email=email,
                full_name=full_name or email,
                password_hash="",  # No password for OAuth users
                role="personal_only",
                is_active=True,
                preferences={"risk_tolerance": 50, "oauth_provider": "google"},
            )
            db.add(user)

        # Log activity
        activity = ActivityLog(
            user_id=user.id if user.id else None,
            action_type="oauth_login",
            resource_type="session",
            resource_id=user.id if user.id else None,
            details={"provider": "google", "email": email},
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )
        db.add(activity)
        db.commit()
        db.refresh(user)

        # Generate JWT tokens
        tokens = create_token_pair(
            user,
            db,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )

        return tokens

    except OAuthError as e:
        logger.error(f"❌ Google OAuth error: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google OAuth failed: {e!s}",
        )


@router.get("/auth/apple/login")
async def apple_login(request: Request):
    """
    Initiate Apple OAuth flow

    Redirects user to Apple sign-in page.
    After authentication, Apple redirects back to /auth/apple/callback.
    """
    # Build callback URL (must match Apple Services redirect URI)
    redirect_uri = str(request.url_for("apple_callback"))

    logger.info("🍎 Initiating Apple OAuth flow", extra={"redirect_uri": redirect_uri})

    return await oauth.apple.authorize_redirect(request, redirect_uri)


@router.get("/auth/apple/callback", response_model=TokenResponse)
async def apple_callback(request: Request, db: Session = Depends(get_db)):
    """
    Handle Apple OAuth callback

    Exchanges authorization code for user info,
    creates or links user account, and returns JWT tokens.

    Returns:
    - Access token (15min expiry)
    - Refresh token (7 days expiry)

    Errors:
    - 500: OAuth exchange failed
    """
    try:
        # Exchange authorization code for access token
        token = await oauth.apple.authorize_access_token(request)
        user_info = token.get("userinfo")

        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get user info from Apple",
            )

        email = user_info.get("email")
        # Apple doesn't always provide name on subsequent logins
        full_name = (
            user_info.get("name", {}).get("firstName", "")
            + " "
            + user_info.get("name", {}).get("lastName", "")
        )
        full_name = full_name.strip()

        if not email:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No email provided by Apple",
            )

        logger.info(f"✅ Apple OAuth successful for: {email}")

        # Find or create user
        user = db.query(User).filter(User.email == email).first()

        if user:
            # Existing user - log them in
            logger.info(f"🔑 Existing user logging in via Apple: {email}")
            user.last_login_at = datetime.now(UTC)
        else:
            # New user - create account
            logger.info(f"🆕 Creating new user from Apple OAuth: {email}")
            user = User(
                email=email,
                full_name=full_name or email,
                password_hash="",  # No password for OAuth users
                role="personal_only",
                is_active=True,
                preferences={"risk_tolerance": 50, "oauth_provider": "apple"},
            )
            db.add(user)

        # Log activity
        activity = ActivityLog(
            user_id=user.id if user.id else None,
            action_type="oauth_login",
            resource_type="session",
            resource_id=user.id if user.id else None,
            details={"provider": "apple", "email": email},
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )
        db.add(activity)
        db.commit()
        db.refresh(user)

        # Generate JWT tokens
        tokens = create_token_pair(
            user,
            db,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )

        return tokens

    except OAuthError as e:
        logger.error(f"❌ Apple OAuth error: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Apple OAuth failed: {e!s}",
        )
