from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse, StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer, RoleChecker
from db.db import get_session
from stock_cgpisl.service import StockCGPISLService
from stock_cgpisl.schemas import StockCGPISLEnquiry, StockCGPISLEnquiryStockList

stock_cgpisl_router = APIRouter()
stock_cgpisl_service = StockCGPISLService()
access_token_bearer = AccessTokenBearer()
role_checker = Depends(RoleChecker(allowed_roles=["ADMIN"]))


"""
Upload Stock CGPISL data via CSV file.
"""


@stock_cgpisl_router.post(
    "/upload",
    status_code=status.HTTP_200_OK,
    dependencies=[role_checker],
)
async def upload_stock_cgpisl(
    session: AsyncSession = Depends(get_session),
    file: UploadFile = File(...),
    _=Depends(access_token_bearer),
):
    try:
        result = await stock_cgpisl_service.upload_stock_cgpisl(session, file)
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


"""
Stock CGPISL enquiry using query parameters.

 """


@stock_cgpisl_router.get(
    "/enquiry", response_model=List[StockCGPISLEnquiry], status_code=status.HTTP_200_OK
)
async def enquiry_stock_cgpisl(
    spare_description: Optional[str] = None,
    spare_code: Optional[str] = None,
    division: Optional[str] = None,
    available: Optional[str] = None,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    try:
        result = await stock_cgpisl_service.enquiry_stock_cgpisl(
            session,
            spare_description,
            spare_code,
            division,
            available,
        )
        return result
    except:
        return []
    
"""
List all spare records.
"""


@stock_cgpisl_router.get(
    "/spare_list",
    response_model=List[StockCGPISLEnquiryStockList],
    status_code=status.HTTP_200_OK,
)
async def list_spare_list(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    spare_list = await stock_cgpisl_service.list_cgpisl_stock(session)
    return spare_list