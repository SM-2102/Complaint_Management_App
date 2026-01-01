import asyncio
import json
import os

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer
from db.db import get_session
from menu.service import MenuService

menu_router = APIRouter()
menu_service = MenuService()
access_token_bearer = AccessTokenBearer()


@menu_router.get("/dashboard", status_code=status.HTTP_200_OK)
async def get_dashboard_data(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):

    stock = await menu_service.stock_overview(session)
    grc = await menu_service.grc_overview(session)
    complaint = await menu_service.complaint_overview(session)

    dashboard_data = {
        "complaint": complaint["complaint"],
        "stock": stock["stock"],
        "grc": grc["grc"],
    }
    return JSONResponse(content=dashboard_data)
