"""
Google OAuth authentication service.
"""
import logging
import httpx
from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi import HTTPException, status
from app.core.config import settings
from app.schemas.auth import GoogleUserInfo

logger = logging.getLogger(__name__)


class GoogleAuthService:
    """Service for handling Google OAuth authentication."""

    def __init__(self):
        self.client_id = settings.google_client_id

    async def verify_access_token(self, access_token: str) -> GoogleUserInfo:
        """
        Verify Google access token by fetching user info from Google's userinfo endpoint.
        This is used for the implicit OAuth flow (mobile-friendly).

        Args:
            access_token: The access token from Google OAuth

        Returns:
            GoogleUserInfo with user details

        Raises:
            HTTPException if token is invalid
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"}
                )

                if response.status_code != 200:
                    logger.error(f"Google userinfo request failed: {response.status_code}")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid Google access token"
                    )

                userinfo = response.json()

                return GoogleUserInfo(
                    google_id=userinfo['sub'],
                    email=userinfo['email'],
                    full_name=userinfo.get('name', ''),
                    picture=userinfo.get('picture'),
                    email_verified=userinfo.get('email_verified', False)
                )

        except httpx.HTTPError as e:
            logger.error(f"Google access token verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to verify Google access token"
            )

    async def verify_google_token(self, credential: str) -> GoogleUserInfo:
        """
        Verify the Google ID token and extract user information.
        
        Args:
            credential: The ID token from Google Sign-In
            
        Returns:
            GoogleUserInfo with user details
            
        Raises:
            HTTPException if token is invalid
        """
        try:
            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(
                credential,
                requests.Request(),
                self.client_id
            )
            
            # Verify the issuer
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token issuer"
                )
            
            # Extract user info
            return GoogleUserInfo(
                google_id=idinfo['sub'],
                email=idinfo['email'],
                full_name=idinfo.get('name', ''),
                picture=idinfo.get('picture'),
                email_verified=idinfo.get('email_verified', False)
            )
            
        except ValueError as e:
            logger.error(f"Google token verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token"
            )


google_auth_service = GoogleAuthService()

