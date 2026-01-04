import token
from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse, StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer, RoleChecker
from db.db import get_session
from complaints.service import ComplaintsService

complaints_router = APIRouter()
complaints_service = ComplaintsService()
access_token_bearer = AccessTokenBearer()
role_checker = Depends(RoleChecker(allowed_roles=["ADMIN"]))


"""
Upload GRC CGCEL data via CSV file.
"""


@complaints_router.post(
    "/upload",
    status_code=status.HTTP_200_OK,
    dependencies=[role_checker],
)
async def upload_complaints(
    session: AsyncSession = Depends(get_session),
    file: UploadFile = File(...),
    _=Depends(access_token_bearer),
):
    try:
        result = await complaints_service.upload_complaints(session, file)
    except Exception as exc:
        return JSONResponse(
            content={
                "message": "Processing failed",
                "resolution": str(exc),
                "type": "error",
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    if result.get("type") in ("warning", "error"):
        return JSONResponse(
            content=result,
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    # Success
    return JSONResponse(
        content=result,
        status_code=status.HTTP_200_OK,
    )

