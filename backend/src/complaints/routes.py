import token
from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status, Query, Body
from fastapi.responses import JSONResponse, StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer, RoleChecker
from db.db import get_session
from complaints.service import ComplaintsService
from complaints.schemas import ComplaintFilterData, ComplaintEnquiryResponseSchema, ComplaintReallocateRequestSchema, ComplaintResponse, ComplaintTechniciansReallocationSchema, ComplaintUpdateData, CreateComplaint, ComplaintCreateData, EmailSchema
from exceptions import ComplaintNotFound

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

"""
Get list of action heads.
"""

@complaints_router.get(
    "/action_heads",
    status_code=status.HTTP_200_OK,
)
async def get_action_heads(
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    result = await complaints_service.get_action_heads(session)
    return JSONResponse(
        content={"action_heads": result},
    )

"""
Complaint enquiry using query parameters.

"""



@complaints_router.get(
    "/enquiry",
    status_code=status.HTTP_200_OK,
    response_model=List[ComplaintEnquiryResponseSchema],
)
async def enquiry_complaint(
    product_division: Optional[str] = None,
    complaint_type: Optional[str] = None,
    complaint_priority: Optional[str] = None,
    action_head: Optional[str] = None,
    spare_pending: Optional[str] = None,
    final_status: Optional[str] = None,
    action_by: Optional[str] = None,
    complaint_number: Optional[str] = None,
    customer_contact: Optional[str] = None,
    customer_name: Optional[str] = None,
    complaint_head: Optional[str] = None,
    all_complaints: Optional[str] = None,
    spare_pending_complaints: Optional[str] = None,
    crm_open_complaints: Optional[str] = None,
    escalation_complaints: Optional[str] = None,
    mail_to_be_sent_complaints: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    try:
        result = await complaints_service.enquiry_complaint(
            session,
            product_division,
            complaint_type,
            complaint_priority,
            action_head,
            spare_pending,
            final_status,
            action_by,
            complaint_number,
            customer_contact,
            customer_name,
            complaint_head,
            spare_pending_complaints,
            all_complaints,
            crm_open_complaints,
            escalation_complaints,
            mail_to_be_sent_complaints,
            limit,
            offset,
        )
        return result
    except:
        return []


"""
Get complaint filter data.
"""
@complaints_router.get(
    "/complaint_filter_data",
    status_code=status.HTTP_200_OK,
    response_model=ComplaintFilterData,
)
async def get_complaint_filter_data(
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    result = await complaints_service.get_complaint_filter_data(session)
    return result

"""
List of employees.
"""
@complaints_router.get(
    "/employees",
    status_code=status.HTTP_200_OK,
)
async def list_of_employees(
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    result = await complaints_service.get_employees(session)
    return JSONResponse(
        content={"employees": result},
    )

"""
Complaint Data for Reallocation
"""
@complaints_router.get(
    "/complaint_allocation_data/{allocated_to}",
    status_code=status.HTTP_200_OK,
    response_model=List[ComplaintTechniciansReallocationSchema],
)
async def get_complaint_reallocation_data(
    allocated_to: str,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    result = await complaints_service.get_complaint_reallocation_data(session, allocated_to)
    return result

"""
Reallocate Complaints to a new technician.
"""
@complaints_router.post(
    "/reallocate_complaints",
    status_code=status.HTTP_200_OK,
)
async def reallocate_complaints(
    reallocate_request: ComplaintReallocateRequestSchema,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    await complaints_service.reallocate_complaints(session, reallocate_request)
    return JSONResponse("Complaints reallocated successfully.")

"""
Create complaint 
"""
@complaints_router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_complaint(
    complaint: CreateComplaint,
    entryType: str,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    new_complaint = await complaints_service.create_complaint(session, complaint, entryType, token)
    return JSONResponse(content={"message": f"Complaint Created : {new_complaint.complaint_number}"})

"""
Create complaint data
"""
@complaints_router.get(
    "/complaint_create_data",
    status_code=status.HTTP_200_OK,
    response_model=ComplaintCreateData,
)
async def get_complaint_create_data(
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    result = await complaints_service.get_complaint_create_data(session)
    return result

"""
Get complaint details by complaint number.
"""


@complaints_router.get(
    "/by_complaint_number/{complaint_number}", response_model=ComplaintResponse, status_code=status.HTTP_200_OK
)
async def get_complaint_by_code(
    complaint_number: str,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    complaint = await complaints_service.get_complaint_by_number(complaint_number, session)
    return complaint

"""
Update complaint data
"""
@complaints_router.get(
    "/complaint_update_data",
    status_code=status.HTTP_200_OK,
    response_model=ComplaintUpdateData,
)
async def get_complaint_update_data(
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    result = await complaints_service.get_complaint_update_data(session)
    return result

"""
Update complaint details by code if complaint available.
"""


@complaints_router.patch("/update/{complaint_number}", status_code=status.HTTP_202_ACCEPTED)
async def update_complaint(
    complaint_number: str,
    complaint: dict = Body(...),
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    # Pass the raw payload to service; service will handle `revisit` if present
    new_complaint = await complaints_service.update_complaint(complaint_number, complaint, session, token)
    return JSONResponse(content={"message": f"Complaint Updated : {new_complaint.complaint_number}"})

"""
Send pending emails for complaints.
"""
@complaints_router.post("/send_email", status_code=status.HTTP_200_OK)
async def send_pending_emails(
    recipients: List[EmailSchema],
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    await complaints_service.send_pending_emails(session, recipients)
    return JSONResponse(content={"message": f"Emails sent successfully."})

"""
List technicians and emails
"""
@complaints_router.get(
    "/mail_technician_list",
    response_model=List[EmailSchema],
    status_code=status.HTTP_200_OK)
async def get_technician_email_list(
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    result = await complaints_service.get_technician_email_list(session)
    return result