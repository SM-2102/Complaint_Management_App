from typing import List

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer
from db.db import get_session
from customer.schemas import (
    CreateCustomer,
    CustomerCode,
    CustomerName,
    CustomerResponse,
    CustomerResponseForComplaint,
    UpdateCustomer,
)
from exceptions import CustomerNotFound
from customer.service import CustomerService

customer_router = APIRouter()
customer_service = CustomerService()
access_token_bearer = AccessTokenBearer()

"""
Create new Customer if customer name is not taken.
"""


@customer_router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer: CreateCustomer,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    new_customer = await customer_service.create_customer(session, customer, token)
    return JSONResponse(content={"message": f"Customer Created : {new_customer.name}"})


"""
Get the next available customer code.
"""


@customer_router.get("/next_code", status_code=status.HTTP_200_OK)
async def customer_next_code(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    next_code = await customer_service.customer_next_code(session)
    return JSONResponse(content={"next_code": next_code})


"""
List all customer names.
"""


@customer_router.get("/list_names", response_model=List, status_code=status.HTTP_200_OK)
async def list_customer_names(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    names = await customer_service.list_customer_names(session)
    return names


"""
Get customer details by code.
"""


@customer_router.post(
    "/by_code", response_model=CustomerResponse, status_code=status.HTTP_200_OK
)
async def get_customer_by_code(
    data: CustomerCode,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    customer = await customer_service.get_customer_by_code(data.code, session)
    return customer


"""
Get customer details by name.
"""


@customer_router.post(
    "/by_name", response_model=CustomerResponse, status_code=status.HTTP_200_OK
)
async def get_customer_by_name(
    data: CustomerName,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    customer = await customer_service.get_customer_by_name(data.name, session)
    return customer


"""
Update customer details by code if customer available.
"""


@customer_router.patch("/update/{code}", status_code=status.HTTP_202_ACCEPTED)
async def update_customer(
    code: str,
    customer: UpdateCustomer,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    existing_customer = await customer_service.get_customer_by_code(code, session)
    if not existing_customer:
        raise CustomerNotFound()
    new_customer = await customer_service.update_customer(code, customer, session, token)
    return JSONResponse(content={"message": f"Customer Updated : {new_customer.name}"})

"""
Get customer details by name for complaint.
"""


@customer_router.post(
    "/by_name_for_complaint", response_model=CustomerResponseForComplaint, status_code=status.HTTP_200_OK
)
async def get_customer_by_name_for_complaint(
    data: CustomerName,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    customer = await customer_service.get_customer_by_name(data.name, session)
    return customer

