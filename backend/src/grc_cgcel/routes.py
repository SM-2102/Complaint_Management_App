from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse, StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer, RoleChecker
from db.db import get_session

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


# """
# GRC CGCEL enquiry using query parameters.

# """


# @grc_cgcel_router.get(
#     "/enquiry", response_model=List[GRCCGCELEnquiry], status_code=status.HTTP_200_OK
# )
# async def enquiry_grc_cgcel(
#     spare_description: Optional[str] = None,
#     spare_code: Optional[str] = None,
#     division: Optional[str] = None,
#     available: Optional[str] = None,
#     session: AsyncSession = Depends(get_session),
#     _=Depends(access_token_bearer),
# ):
#     try:
#         result = await grc_cgcel_service.enquiry_grc_cgcel(
#             session,
#             spare_description,
#             spare_code,
#             division,
#             available,
#         )
#         return result
#     except:
#         return []


# """
# List all spare records.
# """


# @grc_cgcel_router.get(
#     "/spare_list",
#     response_model=List[GRCCGCELEnquiryGRCList],
#     status_code=status.HTTP_200_OK,
# )
# async def list_spare_list(
#     session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
# ):
#     spare_list = await grc_cgcel_service.list_cgcel_grc(session)
#     return spare_list


# """
# List all spare records by division.
# """


# @grc_cgcel_router.get(
#     "/spare_list_by_division/{division}",
#     response_model=List[GRCCGCELEnquiryGRCList],
#     status_code=status.HTTP_200_OK,
# )
# async def list_spare_list(
#     division: str,
#     session: AsyncSession = Depends(get_session),
#     _=Depends(access_token_bearer),
# ):
#     spare_list = await grc_cgcel_service.list_cgcel_grc_by_division(
#         session, division
#     )
#     return spare_list


# """
# Get cgcel details by code.
# """


# @grc_cgcel_router.post(
#     "/by_code",
#     response_model=GRCCGCELCreateIndentResponse,
#     status_code=status.HTTP_200_OK,
# )
# async def get_cgcel_by_code(
#     data: GRCCGCELCode,
#     session: AsyncSession = Depends(get_session),
#     _=Depends(access_token_bearer),
# ):
#     spare = await grc_cgcel_service.get_grc_cgcel_by_code(data.spare_code, session)
#     return spare


# """
# Get cgcel details by name.
# """


# @grc_cgcel_router.post(
#     "/by_name",
#     response_model=GRCCGCELCreateIndentResponse,
#     status_code=status.HTTP_200_OK,
# )
# async def get_cgcel_by_name(
#     data: GRCCGCELDescription,
#     session: AsyncSession = Depends(get_session),
#     _=Depends(access_token_bearer),
# ):
#     spare = await grc_cgcel_service.get_grc_cgcel_by_name(
#         data.spare_description, session
#     )
#     return spare


# """
# Create spare indent (adding to cart)
# """


# @grc_cgcel_router.patch(
#     "/create_indent/{spare_code}", status_code=status.HTTP_202_ACCEPTED
# )
# async def update_grc_cgcel(
#     spare_code: str,
#     indentData: GRCCGCELIndentCreate,
#     session: AsyncSession = Depends(get_session),
#     _=Depends(access_token_bearer),
# ):
#     new_record = await grc_cgcel_service.create_indent_cgcel(
#         spare_code, indentData, session
#     )
#     return JSONResponse(
#         content={"message": f"Indent Created : {new_record.spare_code}"}
#     )


# """
# Update CGCEL Update and add Movement
# """


# @grc_cgcel_router.post("/update", status_code=status.HTTP_202_ACCEPTED)
# async def update_cgcel_grc(
#     data: GRCCGCELUpdate,
#     session: AsyncSession = Depends(get_session),
#     token=Depends(access_token_bearer),
# ):
#     updated_record = await grc_cgcel_service.update_cgcel_grc(data, session, token)
#     return JSONResponse(
#         content={"message": f"GRC Updated : {updated_record.spare_code}"}
#     )


# """
# Get CGCEL indent details by division
# """


# @grc_cgcel_router.get(
#     "/indent_details/{division}",
#     response_model=List[GRCCGCELGenerateIndentResponse],
#     status_code=status.HTTP_200_OK,
# )
# async def get_cgcel_indent_details_by_division(
#     division: str,
#     session: AsyncSession = Depends(get_session),
#     _=Depends(access_token_bearer),
# ):
#     indent_details = await grc_cgcel_service.get_cgcel_indent_details_by_division(
#         division, session
#     )
#     return indent_details


# """
# Get the next available indent code.
# """


# @grc_cgcel_router.get("/next_indent_code", status_code=status.HTTP_200_OK)
# async def next_cgcel_indent_code(
#     session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
# ):
#     indent_number = await grc_cgcel_service.next_cgcel_indent_code(session)
#     return JSONResponse(content={"next_cgcel_indent_code": indent_number})


# """
# Generate CGCEL Indent for a division.
# """


# @grc_cgcel_router.post("/generate_indent", status_code=status.HTTP_200_OK)
# async def generate_cgcel_indent(
#     indentData: GRCCGCELGenerateIndentRecord,
#     session: AsyncSession = Depends(get_session),
#     token=Depends(access_token_bearer),
# ):
#     await grc_cgcel_service.generate_cgcel_indent(indentData, session, token)
#     return JSONResponse(content={"message": "Indent Generated"})


# """
# GRC CGCEL Indent enquiry using query parameters.

# """


# @grc_cgcel_router.get(
#     "/indent_enquiry",
#     response_model=List[GRCCGCELIndentEnquiry],
#     status_code=status.HTTP_200_OK,
# )
# async def enquiry_indent_cgcel(
#     spare_description: Optional[str] = None,
#     spare_code: Optional[str] = None,
#     division: Optional[str] = None,
#     from_indent_date: Optional[date] = None,
#     to_indent_date: Optional[date] = None,
#     from_indent_number: Optional[str] = None,
#     to_indent_number: Optional[str] = None,
#     session: AsyncSession = Depends(get_session),
#     _=Depends(access_token_bearer),
# ):
#     try:
#         result = await grc_cgcel_service.enquiry_indent_cgcel(
#             session,
#             spare_description,
#             spare_code,
#             division,
#             from_indent_date,
#             to_indent_date,
#             from_indent_number,
#             to_indent_number,
#         )
#         return result
#     except:
#         return []
