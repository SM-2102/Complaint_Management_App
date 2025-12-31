from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse, StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer, RoleChecker
from db.db import get_session
from stock_cgcel.schemas import (
    StockCGCELCode,
    StockCGCELCreateIndentResponse,
    StockCGCELDescription,
    StockCGCELEnquiry,
    StockCGCELEnquiryStockList,
    StockCGCELGenerateIndentRecord,
    StockCGCELGenerateIndentResponse,
    StockCGCELIndentCreate,
    StockCGCELIndentEnquiry,
    StockCGCELUpdate,
)
from stock_cgcel.service import StockCGCELService

stock_cgcel_router = APIRouter()
stock_cgcel_service = StockCGCELService()
access_token_bearer = AccessTokenBearer()
role_checker = Depends(RoleChecker(allowed_roles=["ADMIN"]))


"""
Upload Stock CGCEL data via CSV file.
"""


@stock_cgcel_router.post(
    "/upload",
    status_code=status.HTTP_200_OK,
    dependencies=[role_checker],
)
async def upload_stock_cgcel(
    session: AsyncSession = Depends(get_session),
    file: UploadFile = File(...),
    _=Depends(access_token_bearer),
):
    try:
        result = await stock_cgcel_service.upload_stock_cgcel(session, file)
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
Stock CGCEL enquiry using query parameters.

"""


@stock_cgcel_router.get(
    "/enquiry", status_code=status.HTTP_200_OK
)
async def enquiry_stock_cgcel(
    spare_description: Optional[str] = None,
    spare_code: Optional[str] = None,
    division: Optional[str] = None,
    cnf: Optional[str] = None,
    grc: Optional[str] = None,
    own: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    try:
        result, total_records = await stock_cgcel_service.enquiry_stock_cgcel(
            session,
            spare_description,
            spare_code,
            division,
            cnf,
            grc,
            own,
            limit,
            offset,
            return_total=True
        )
        return {"records": result, "total_records": total_records}
    except Exception as exc:
        return {"records": [], "total_records": 0}


"""
List all spare records.
"""


@stock_cgcel_router.get(
    "/spare_list",
    response_model=List[StockCGCELEnquiryStockList],
    status_code=status.HTTP_200_OK,
)
async def list_spare_list(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    spare_list = await stock_cgcel_service.list_cgcel_stock(session)
    return spare_list


"""
List all spare records by division.
"""


@stock_cgcel_router.get(
    "/spare_list_by_division/{division}",
    response_model=List[StockCGCELEnquiryStockList],
    status_code=status.HTTP_200_OK,
)
async def list_spare_list(
    division: str,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    spare_list = await stock_cgcel_service.list_cgcel_stock_by_division(
        session, division
    )
    return spare_list


"""
Get cgcel details by code.
"""


@stock_cgcel_router.post(
    "/by_code",
    response_model=StockCGCELCreateIndentResponse,
    status_code=status.HTTP_200_OK,
)
async def get_cgcel_by_code(
    data: StockCGCELCode,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    spare = await stock_cgcel_service.get_stock_cgcel_by_code(data.spare_code, session)
    return spare


"""
Get cgcel details by name.
"""


@stock_cgcel_router.post(
    "/by_name",
    response_model=StockCGCELCreateIndentResponse,
    status_code=status.HTTP_200_OK,
)
async def get_cgcel_by_name(
    data: StockCGCELDescription,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    spare = await stock_cgcel_service.get_stock_cgcel_by_name(
        data.spare_description, session
    )
    return spare


"""
Create spare indent (adding to cart)
"""


@stock_cgcel_router.patch(
    "/create_indent/{spare_code}", status_code=status.HTTP_202_ACCEPTED
)
async def update_stock_cgcel(
    spare_code: str,
    indentData: StockCGCELIndentCreate,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    new_record = await stock_cgcel_service.create_indent_cgcel(
        spare_code, indentData, session
    )
    return JSONResponse(
        content={"message": f"Indent Created : {new_record.spare_code}"}
    )


"""
Update CGCEL Update and add Movement
"""


@stock_cgcel_router.post("/update", status_code=status.HTTP_202_ACCEPTED)
async def update_cgcel_stock(
    data: StockCGCELUpdate,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    updated_record = await stock_cgcel_service.update_cgcel_stock(data, session, token)
    return JSONResponse(
        content={"message": f"Stock Updated : {updated_record.spare_code}"}
    )


"""
Get CGCEL indent details by division
"""


@stock_cgcel_router.get(
    "/indent_details/{division}",
    response_model=List[StockCGCELGenerateIndentResponse],
    status_code=status.HTTP_200_OK,
)
async def get_cgcel_indent_details_by_division(
    division: str,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    indent_details = await stock_cgcel_service.get_cgcel_indent_details_by_division(
        division, session
    )
    return indent_details


"""
Get the next available indent code.
"""


@stock_cgcel_router.get("/next_indent_code", status_code=status.HTTP_200_OK)
async def next_cgcel_indent_code(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    indent_number = await stock_cgcel_service.next_cgcel_indent_code(session)
    return JSONResponse(content={"next_cgcel_indent_code": indent_number})


"""
Generate CGCEL Indent for a division.
"""


@stock_cgcel_router.post("/generate_indent", status_code=status.HTTP_200_OK)
async def generate_cgcel_indent(
    indentData: StockCGCELGenerateIndentRecord,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    await stock_cgcel_service.generate_cgcel_indent(indentData, session, token)
    return JSONResponse(content={"message": "Indent Generated"})


"""
Stock CGCEL Indent enquiry using query parameters.

"""


@stock_cgcel_router.get(
    "/indent_enquiry",
    status_code=status.HTTP_200_OK,
)
async def enquiry_indent_cgcel(
    spare_description: Optional[str] = None,
    spare_code: Optional[str] = None,
    division: Optional[str] = None,
    from_indent_date: Optional[date] = None,
    to_indent_date: Optional[date] = None,
    from_indent_number: Optional[str] = None,
    to_indent_number: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    try:
        result, total_records = await stock_cgcel_service.enquiry_indent_cgcel(
            session,
            spare_description,
            spare_code,
            division,
            from_indent_date,
            to_indent_date,
            from_indent_number,
            to_indent_number,
            limit,
            offset,
            return_total=True
        )
        return {"records": result, "total_records": total_records}
    except Exception as exc:
        return {"records": [], "total_records": 0}
