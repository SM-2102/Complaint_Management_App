import token
from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse, StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer, RoleChecker
from db.db import get_session
from grc_cgcel.schemas import (
    GRCCGCELReceiveSchema,
    GRCCGCELReturnSave,
    GRCCGCELReturnSchema,
    GRCCGCELUpdateReceiveSchema,
    GRCFullPayload,
    GRCCGCELReturnFinalizePayload,
    GRCCGCELEnquiry,
)
from grc_cgcel.service import GRCCGCELService

grc_cgcel_router = APIRouter()
grc_cgcel_service = GRCCGCELService()
access_token_bearer = AccessTokenBearer()
role_checker = Depends(RoleChecker(allowed_roles=["ADMIN"]))


"""
Upload GRC CGCEL data via CSV file.
"""


@grc_cgcel_router.post(
    "/upload",
    status_code=status.HTTP_200_OK,
    dependencies=[role_checker],
)
async def upload_grc_cgcel(
    session: AsyncSession = Depends(get_session),
    file: UploadFile = File(...),
    _=Depends(access_token_bearer),
):
    try:
        result = await grc_cgcel_service.upload_grc_cgcel(session, file)
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
GRC Numbers not received yet.
"""


@grc_cgcel_router.get(
    "/not_received_grc",
    response_model=List[int],
    status_code=status.HTTP_200_OK,
)
async def not_received_grc(
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    result = await grc_cgcel_service.not_received_grc_numbers(session)
    return result


"""
Not received details by grc number
"""


@grc_cgcel_router.get(
    "/not_received_by_grc_number/{grc_number}",
    response_model=List[GRCCGCELReceiveSchema],
    status_code=status.HTTP_200_OK,
)
async def not_received_by_grc_number(
    grc_number: int,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    result = await grc_cgcel_service.not_received_by_grc_number(grc_number, session)
    return result


"""
Update GRC CGCEL Receive Details
"""


@grc_cgcel_router.post(
    "/update_receive",
    status_code=status.HTTP_202_ACCEPTED,
)
async def update_grc_cgcel_receive(
    data: List[GRCCGCELUpdateReceiveSchema],
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    await grc_cgcel_service.update_cgcel_grc_receive(data, session)
    return JSONResponse(content={"message": f"GRC Receive Details Updated"})


"""
Get GRC Return by Division
"""


@grc_cgcel_router.get(
    "/grc_return_by_division/{division}",
    response_model=List[GRCCGCELReturnSchema],
    status_code=status.HTTP_200_OK,
)
async def grc_return_by_division(
    division: str,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    result = await grc_cgcel_service.grc_return_by_division(division, session)
    return result


"""
GRC CGCEL Save GRC Return Details
"""


@grc_cgcel_router.post(
    "/save_grc_return",
    status_code=status.HTTP_202_ACCEPTED,
)
async def save_grc_cgcel_return(
    data: List[GRCCGCELReturnSave],
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    await grc_cgcel_service.save_cgcel_grc_return(data, session)
    return JSONResponse(content={"message": f"GRC Return Details Saved"})


"""
GRC CGCEL Finalize GRC Return Details
"""


@grc_cgcel_router.post(
    "/finalize_grc_return",
    status_code=status.HTTP_202_ACCEPTED,
)
async def finalize_grc_cgcel_return(
    data: GRCCGCELReturnFinalizePayload,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    await grc_cgcel_service.finalize_cgcel_grc_return(data, session, token)
    return JSONResponse(content={"message": f"GRC Return Details Finalized"})


"""
Get the next available challan code.
"""


@grc_cgcel_router.get("/next_challan_code", status_code=status.HTTP_200_OK)
async def next_cgcel_challan_code(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    challan_number = await grc_cgcel_service.next_cgcel_challan_code(session)
    return JSONResponse(content={"next_cgcel_challan_code": challan_number})


"""
GRC Print Report
"""


@grc_cgcel_router.post(
    "/print_report/{report_type}",
    status_code=status.HTTP_200_OK,
)
async def print_grc_report(
    report_type: str,
    data: GRCFullPayload,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    grc_pdf = await grc_cgcel_service.generate_grc_report(
        report_type, data, session, token
    )
    return StreamingResponse(
        grc_pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{data.challan_number}.pdf"'
        },
    )

"""
GRC CGCEL enquiry using query parameters.

"""


@grc_cgcel_router.get(
    "/enquiry",
    status_code=status.HTTP_200_OK,
)
async def enquiry_grc_cgcel(
    division: Optional[str] = None,
    spare_code: Optional[str] = None,
    from_grc_date: Optional[date] = None,
    to_grc_date: Optional[date] = None,
    grc_number: Optional[str] = None,
    challan_number: Optional[str] = None,
    grc_status: Optional[str] = "N",
    limit: int = 100,
    offset: int = 0,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    try:
        result, total_records = await grc_cgcel_service.enquiry_grc_cgcel(
            session,
            division,
            spare_code,
            from_grc_date,
            to_grc_date,
            grc_number,
            challan_number,
            grc_status,
            limit,
            offset,
            return_total=True,
        )
        return {"records": result, "total_records": total_records}
    except Exception as exc:
        return {"records": [], "total_records": 0}
