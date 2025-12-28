from typing import List

from fastapi import Depends, Request
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio.session import AsyncSession

from auth.models import User
from db.db import get_session
from exceptions import (
    AccessDenied,
    AccessTokenRequired,
    InvalidToken,
    RefreshTokenRequired,
)

from .service import AuthService
from .utils import decode_user_token

auth_service = AuthService()


class TokenBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request) -> dict:
        # Try to get token from Authorization header first
        auth_header = request.headers.get("authorization")
        token = None
        if auth_header and auth_header.lower().startswith("bearer "):
            token = auth_header.split(" ", 1)[1]
        # If not present, try to get from cookie
        if not token:
            # For refresh token endpoints, use the refresh_token cookie
            if isinstance(self, RefreshTokenBearer):
                token = request.cookies.get("refresh_token")
            else:
                token = request.cookies.get("access_token")
        if not token:
            raise InvalidToken()
        token_data = decode_user_token(token)
        if not self.token_valid(token):
            raise InvalidToken()
        self.verify_token_data(token_data)
        return token_data

    def token_valid(self, token: str) -> bool:
        token_data = decode_user_token(token)
        return token_data is not None

    def verify_token_data(self, token_data: dict):
        raise NotImplementedError("Override this method in subclasses")


class AccessTokenBearer(TokenBearer):

    def verify_token_data(self, token_data: dict) -> None:
        if token_data and token_data["refresh"]:
            raise AccessTokenRequired()


class RefreshTokenBearer(TokenBearer):

    def verify_token_data(self, token_data: dict) -> None:
        if token_data and not token_data["refresh"]:
            raise RefreshTokenRequired()


async def get_current_user(
    token_data: dict = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
):
    username = token_data["user"]["username"]
    return await auth_service.get_user_by_username(username, session)


class RoleChecker:
    def __init__(self, allowed_roles: List[str]) -> None:
        self.allowed_roles = allowed_roles

    async def __call__(self, current_user: User = Depends(get_current_user)):
        if current_user.role in self.allowed_roles:
            return True
        raise AccessDenied()
