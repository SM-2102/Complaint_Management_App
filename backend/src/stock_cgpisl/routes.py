from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse, StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer, RoleChecker
from db.db import get_session
from stock_cgpisl.schemas import (
    StockCGPISLCode,
    StockCGPISLCreateIndentResponse,
    StockCGPISLDescription,
    StockCGPISLEnquiry,
    StockCGPISLEnquiryStockList,
    StockCGPISLGenerateIndentRecord,
    StockCGPISLGenerateIndentResponse,
    StockCGPISLIndentCreate,
    StockCGPISLIndentEnquiry,
)
from stock_cgpisl.service import StockCGPISLService

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


"""
List all spare records by division.
"""


@stock_cgpisl_router.get(
    "/spare_list_by_division/{division}",
    response_model=List[StockCGPISLEnquiryStockList],
    status_code=status.HTTP_200_OK,
)
async def list_spare_list(
    division: str,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    spare_list = await stock_cgpisl_service.list_cgpisl_stock_by_division(
        session, division
    )
    return spare_list


"""
Get cgpisl details by code.
"""


@stock_cgpisl_router.post(
    "/by_code",
    response_model=StockCGPISLCreateIndentResponse,
    status_code=status.HTTP_200_OK,
)
async def get_cgpisl_by_code(
    data: StockCGPISLCode,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    spare = await stock_cgpisl_service.get_stock_cgpisl_by_code(
        data.spare_code, session
    )
    return spare


"""
Get cgpisl details by name.
"""


@stock_cgpisl_router.post(
    "/by_name",
    response_model=StockCGPISLCreateIndentResponse,
    status_code=status.HTTP_200_OK,
)
async def get_cgpisl_by_name(
    data: StockCGPISLDescription,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    spare = await stock_cgpisl_service.get_stock_cgpisl_by_name(
        data.spare_description, session
    )
    return spare


"""
Create spare indent (adding to cart)
"""


@stock_cgpisl_router.patch(
    "/create_indent/{spare_code}", status_code=status.HTTP_202_ACCEPTED
)
async def update_stock_cgpisl(
    spare_code: str,
    indentData: StockCGPISLIndentCreate,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    new_record = await stock_cgpisl_service.create_indent_cgpisl(
        spare_code, indentData, session
    )
    return JSONResponse(
        content={"message": f"Indent Created : {new_record.spare_code}"}
    )


"""
Get CGPISL indent details by division
"""


@stock_cgpisl_router.get(
    "/indent_details/{division}",
    response_model=List[StockCGPISLGenerateIndentResponse],
    status_code=status.HTTP_200_OK,
)
async def get_cgpisl_indent_details_by_division(
    division: str,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    indent_details = await stock_cgpisl_service.get_cgpisl_indent_details_by_division(
        division, session
    )
    return indent_details


"""
Get the next available indent code.
"""


@stock_cgpisl_router.get("/next_indent_code", status_code=status.HTTP_200_OK)
async def next_cgpisl_indent_code(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    indent_number = await stock_cgpisl_service.next_cgpisl_indent_code(session)
    return JSONResponse(content={"next_cgpisl_indent_code": indent_number})


"""
Generate CGPISL Indent for a division.
"""


@stock_cgpisl_router.post("/generate_indent", status_code=status.HTTP_200_OK)
async def generate_cgpisl_indent(
    indentData: StockCGPISLGenerateIndentRecord,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    await stock_cgpisl_service.generate_cgpisl_indent(indentData, session, token)
    return JSONResponse(content={"message": "Indent Generated"})


"""
Stock CGPISL Indent enquiry using query parameters.

"""


@stock_cgpisl_router.get(
    "/indent_enquiry",
    response_model=List[StockCGPISLIndentEnquiry],
    status_code=status.HTTP_200_OK,
)
async def enquiry_indent_cgpisl(
    spare_description: Optional[str] = None,
    spare_code: Optional[str] = None,
    division: Optional[str] = None,
    from_indent_date: Optional[date] = None,
    to_indent_date: Optional[date] = None,
    from_indent_number: Optional[str] = None,
    to_indent_number: Optional[str] = None,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    try:
        result = await stock_cgpisl_service.enquiry_indent_cgpisl(
            session,
            spare_description,
            spare_code,
            division,
            from_indent_date,
            to_indent_date,
            from_indent_number,
            to_indent_number,
        )
        return result
    except:
        return []
