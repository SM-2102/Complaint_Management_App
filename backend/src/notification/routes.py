from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from notification.schema import NotificationResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer, RoleChecker
from db.db import get_session
from notification.service import NotificationService
from notification.schema import NotificationCreate, NotificationDetails
from typing import List
notification_router = APIRouter()
notification_service = NotificationService()
access_token_bearer = AccessTokenBearer()
role_checker = Depends(RoleChecker(allowed_roles=["ADMIN"]))


"""
Create a new notification.
"""


@notification_router.post(
    "/create_notification", status_code=status.HTTP_201_CREATED, 
    dependencies=[role_checker]
)
async def create_notification(
    notification: NotificationCreate,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    await notification_service.create_notification(session, notification)
    return JSONResponse(
        content={"message": "Task assigned successfully."}
    )


"""
List all unresolved notifications.
"""


@notification_router.get(
    "/notifications",
    status_code=status.HTTP_200_OK,
    response_model=list[NotificationResponse],
    dependencies=[role_checker],
)
async def list_notifications(
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    notifications = await notification_service.list_notifications(session)
    return notifications


"""
List the count of unresolved notifications.
"""


@notification_router.get(
    "/count_notifications",
    status_code=status.HTTP_200_OK,
    dependencies=[role_checker],
)
async def list_notifications(
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    count_notifications = await notification_service.count_notifications(session)
    return JSONResponse(content={"count": count_notifications})


"""
List all user notifications.
"""


@notification_router.get(
    "/user_notifications",
    status_code=status.HTTP_200_OK,
    response_model=List[NotificationDetails],
)
async def list_user_notifications(
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    notifications = await notification_service.list_user_notifications(session, token)
    return notifications


"""
Resolve a notification by id.
"""

@notification_router.post(
    "/resolve_notification",
    status_code=status.HTTP_200_OK,
)
async def resolve_notification(
    id : int,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    await notification_service.resolve_notification(session, id)
    return JSONResponse(
        content={"message": f"Notification resolved successfully."}
    )

