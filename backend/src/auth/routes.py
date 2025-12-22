from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer, RefreshTokenBearer
from auth.service import AuthService
from db.db import get_session
from exceptions import InvalidToken

from .schemas import UserLogin, UserResponse
from .utils import create_user_token

REFRESH_TOKEN_EXPIRY_DAYS = 1

auth_router = APIRouter()
auth_service = AuthService()
access_token_bearer = AccessTokenBearer()
refresh_token_bearer = RefreshTokenBearer()


# """
# Check user login credentials
# """


@auth_router.post("/login", status_code=status.HTTP_200_OK)
async def login(user: UserLogin, session: AsyncSession = Depends(get_session)):
    valid_user = await auth_service.login(user, session)
    access_token = create_user_token(
        user_data={"username": valid_user.username, "role": valid_user.role}
    )
    refresh_token = create_user_token(
        user_data={"username": valid_user.username, "role": valid_user.role},
        expiry=timedelta(days=REFRESH_TOKEN_EXPIRY_DAYS),
        refresh=True,
    )
    response = JSONResponse(
        content={
            "message": f"User {valid_user.username} logged in successfully.",
        }
    )
    # Set the access token as an HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # Set to True in production (requires HTTPS)
        samesite="lax",  # Or 'strict' or 'none' as needed
        max_age=3600 * 1,  # 1 hour
        path="/",
    )
    # Optionally, set the refresh token as a cookie too
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Set to True in production
        samesite="lax",
        max_age=3600 * 3 * REFRESH_TOKEN_EXPIRY_DAYS,
        path="/",
    )
    return response


# """
# Clear the user session and csrf on logout
# """


@auth_router.post("/logout", status_code=status.HTTP_200_OK)
async def logout():
    response = JSONResponse(content={"message": "User logged out successfully."})
    # Clear the cookies
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return response


# """
# Get current logged in user details.
# """


@auth_router.get("/me", status_code=status.HTTP_200_OK, response_model=UserResponse)
async def get_current_user(
    token_data=Depends(access_token_bearer),
    session: AsyncSession = Depends(get_session),
):
    username = token_data["user"]["username"]
    user = await auth_service.get_user_by_username(username, session)
    return user


# """
# For refresh token to get a new access token.
# """


@auth_router.post("/refresh_token", status_code=status.HTTP_200_OK)
async def refresh_token(token_data=Depends(refresh_token_bearer)):
    expiry_timestamp = token_data["exp"]
    if datetime.fromtimestamp(expiry_timestamp) > datetime.now():
        new_access_token = create_user_token(
            user_data={
                "username": token_data["user"]["username"],
                "role": token_data["user"].get("role", "USER"),
            }
        )
        response = JSONResponse(
            content={"message": "Access token refreshed successfully."}
        )
        response.set_cookie(
            key="access_token",
            value=new_access_token,
            httponly=True,
            secure=False,  # Set to True in production
            samesite="lax",
            max_age=3600 * 1,  # 1 hour
            path="/",
        )
        return response
    raise InvalidToken()
