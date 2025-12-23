from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy.future import select

from employee.models import Employee
from employee.schema import EmployeeCreate
from auth.service import AuthService
from exceptions import EmployeeNotFound, CannotDeleteCurrentUser

user_service = AuthService()

class EmployeeService:

    async def list_employees(self, session: AsyncSession):
        statement = select(Employee).where(Employee.is_active == "Y").order_by(Employee.name)
        result = await session.execute(statement)
        return result.scalars().all()

    async def list_standard_employees(self, session: AsyncSession):
        statement = select(Employee).where((Employee.is_active == "Y") & ((Employee.role == "USER") | (Employee.role == "TECHNICIAN"))).order_by(Employee.name)
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
        existing_employee = await self.get_employee_by_name(name, session)
        return existing_employee is not None

    async def get_employee_by_name(self, name: str, session: AsyncSession):
        name = name.strip()
        name = " ".join(name.split())
        statement = select(Employee).where(
            Employee.name.ilike(name), Employee.is_active == "Y"
        )
        result = await session.execute(statement)
        return result.scalars().first()

    async def delete_employee(self, name: str, session: AsyncSession, token: dict):
        employee_to_delete = await self.get_employee_by_name(name, session)
        if not employee_to_delete:
            raise EmployeeNotFound()
        if token["user"]["username"] == name:
            raise CannotDeleteCurrentUser()
        employee_to_delete.is_active = "N"
        session.add(employee_to_delete)
        await session.commit()
