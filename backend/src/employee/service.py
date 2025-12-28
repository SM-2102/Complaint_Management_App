from sqlalchemy import case
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy.future import select

from auth.service import AuthService
from employee.models import Employee
from employee.schema import EmployeeCreate, EmployeeLeave
from exceptions import CannotDeleteCurrentUser, EmployeeNotFound

user_service = AuthService()


class EmployeeService:

    async def list_employees(self, session: AsyncSession):
        role_order = case(
            (Employee.role == "ADMIN", 1),
            (Employee.role == "USER", 2),
            (Employee.role == "TECHNICIAN", 3),
            else_=4,
        )
        statement = (
            select(Employee).where(Employee.is_active == "Y").order_by(role_order)
        )
        result = await session.execute(statement)
        return result.scalars().all()

    async def list_standard_employees(self, session: AsyncSession):
        statement = (
            select(Employee)
            .where(
                (Employee.is_active == "Y")
                & ((Employee.role == "USER") | (Employee.role == "TECHNICIAN"))
            )
            .order_by(Employee.role)
        )
        result = await session.execute(statement)
        return result.scalars().all()

    async def create_employee(self, session: AsyncSession, employee: EmployeeCreate):
        employee.name = employee.name.strip()
        employee.name = " ".join(employee.name.split())
        employee_data_dict = employee.model_dump()
        new_employee = Employee(**employee_data_dict)
        session.add(new_employee)
        try:
            await session.commit()
        except:
            await session.rollback()
            raise IntegrityError()
        if employee.role == "ADMIN" or employee.role == "USER":
            await user_service.create_user(session, employee)
        return new_employee

    async def employee_exists(self, name: str, session: AsyncSession) -> bool:
        name = name.strip()
        name = " ".join(name.split())
        statement = select(Employee).where(Employee.name.ilike(name))
        result = await session.execute(statement)
        return result.scalars().first()

    async def get_employee_by_name(self, name: str, session: AsyncSession):
        name = name.strip()
        name = " ".join(name.split())
        statement = select(Employee).where(
            Employee.name.ilike(name), Employee.is_active == "Y"
        )
        result = await session.execute(statement)
        return result.scalars().first()

    async def delete_employee(
        self, employee: EmployeeLeave, session: AsyncSession, token: dict
    ):
        employee_to_delete = await self.get_employee_by_name(employee.name, session)
        if not employee_to_delete:
            raise EmployeeNotFound()
        if token["user"]["username"] == employee.name:
            raise CannotDeleteCurrentUser()
        employee_to_delete.is_active = "N"
        employee_to_delete.leaving_date = employee.leaving_date
        session.add(employee_to_delete)
        await session.commit()
        if employee_to_delete.role in ["ADMIN", "USER"]:
            await user_service.delete_user(employee.name, session)
