from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer, RoleChecker
from db.db import get_session
from parameter.service import ParameterService
from parameter.schemas import ParameterSchema

parameter_router = APIRouter()
parameter_service = ParameterService()
access_token_bearer = AccessTokenBearer()
role_checker = Depends(RoleChecker(allowed_roles=["ADMIN"]))

"""
List all parameters.
"""


@parameter_router.get(
    "/parameters",
    status_code=status.HTTP_200_OK,
    response_model=ParameterSchema,
    dependencies=[role_checker],
)
async def list_parameters(
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    parameters = await parameter_service.list_parameters(session)
    return parameters


"""
Modify parameter values.
"""
@parameter_router.patch(
    "/update",
    status_code=status.HTTP_200_OK,
    dependencies=[role_checker],
)
async def modify_parameters(
    parameter_updates: ParameterSchema,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    await parameter_service.update_parameters(session, parameter_updates)
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Parameters updated successfully."},)