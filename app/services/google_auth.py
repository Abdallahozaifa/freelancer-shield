"""
Google OAuth authentication service.
"""
import logging
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

