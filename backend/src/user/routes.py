from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer, RoleChecker
from db.db import get_session
from exceptions import UserAlreadyExists
from user.schema import UserChangePassword, UserCreate, Username, UserResponse
from user.service import UserService

user_router = APIRouter()
user_service = UserService()
access_token_bearer = AccessTokenBearer()
role_checker = Depends(RoleChecker(allowed_roles=["ADMIN"]))


"""
Check if user exists, create new user if not.
"""


@user_router.post(
    "/create_user", status_code=status.HTTP_201_CREATED, dependencies=[role_checker]
)
async def create_user(
    user: UserCreate,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    user_exists = await user_service.user_exists(user.username, session)
    if user_exists:
        raise UserAlreadyExists()
    created_user = await user_service.create_user(session, user)
    return JSONResponse(
        content={"message": f"User {created_user.username} created successfully."}
    )


"""
List all users.
"""


@user_router.get(
    "/users",
    status_code=status.HTTP_200_OK,
    response_model=list[UserResponse],
    dependencies=[role_checker],
)
async def list_users(
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    users = await user_service.list_users(session)
    return users


"""
List all standard users.
"""


@user_router.get(
    "/standard_users",
    status_code=status.HTTP_200_OK,
    response_model=list[UserResponse],
)
async def list_standard_users(
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    users = await user_service.list_standard_users(session)
    return users


"""
Delete a user by username if the user isnt the current user.
"""


@user_router.delete(
    "/delete_user",
    status_code=status.HTTP_200_OK,
    dependencies=[role_checker],
)
async def delete_user(
    user: Username,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    await user_service.delete_user(user.username, session, token)
    return JSONResponse(
        content={"message": f"User {user.username} deleted successfully."}
    )


"""
Check whether password matches and change to new password.
"""


@user_router.post("/reset_password", status_code=status.HTTP_200_OK)
async def reset_password(
    user: UserChangePassword,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    user = await user_service.reset_password(user, session)
    return JSONResponse(
        content={"message": f"User {user.username} password changed successfully."}
    )
