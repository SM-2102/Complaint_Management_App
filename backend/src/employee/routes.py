from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer, RoleChecker
from db.db import get_session
from exceptions import EmployeeAlreadyExists
from employee.schema import EmployeeCreate, EmployeeResponse, EmployeeLeave
from employee.service import EmployeeService

employee_router = APIRouter()
employee_service = EmployeeService()
access_token_bearer = AccessTokenBearer()
role_checker = Depends(RoleChecker(allowed_roles=["ADMIN"]))


"""
Check if employee exists, create new employee if not.
"""


@employee_router.post(
    "/create_employee", status_code=status.HTTP_201_CREATED, dependencies=[role_checker]
)
async def create_employee(
    employee: EmployeeCreate,
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    employee_exists = await employee_service.employee_exists(employee.name, session)
    if employee_exists:
        raise EmployeeAlreadyExists()
    created_employee = await employee_service.create_employee(session, employee)
    return JSONResponse(
        content={"message": f"Employee {created_employee.name} created successfully."}
    )


"""
List all employees.
"""


@employee_router.get(
    "/employees",
    status_code=status.HTTP_200_OK,
    response_model=list[EmployeeResponse],
    dependencies=[role_checker],
)
async def list_employees(
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    employees = await employee_service.list_employees(session)
    return employees


"""
List all standard employees.
"""


@employee_router.get(
    "/standard_employees",
    status_code=status.HTTP_200_OK,
    response_model=list[EmployeeResponse],
)
async def list_standard_employees(
    session: AsyncSession = Depends(get_session),
    _=Depends(access_token_bearer),
):
    employees = await employee_service.list_standard_employees(session)
    return employees


"""
Delete a employee by employeename if the employee isnt the current employee.
"""


@employee_router.delete(
    "/delete_employee",
    status_code=status.HTTP_200_OK,
    dependencies=[role_checker],
)
async def delete_employee(
    employee: EmployeeLeave,
    session: AsyncSession = Depends(get_session),
    token=Depends(access_token_bearer),
):
    await employee_service.delete_employee(employee.name, session, token)
    return JSONResponse(
        content={"message": f"Employee {employee.name} deleted successfully."}
    )
