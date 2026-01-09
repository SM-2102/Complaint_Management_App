from sqlalchemy import func, select, union_all
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession

from exceptions import (
     CustomerAlreadyExists,
     CustomerNotFound,
        CannotChangeCustomerName,
        IncorrectCodeFormat,
)   
from .models import Customer
from .schemas import CreateCustomer, UpdateCustomer


class CustomerService:

    async def create_customer(
        self, session: AsyncSession, customer: CreateCustomer, token: dict
    ):
        for _ in range(3):  # Retry up to 3 times
            customer_data_dict = customer.model_dump()
            customer_data_dict["code"] = await self.customer_next_code(session)
            if await self.check_customer_name_available(customer.name, session):
                raise CustomerAlreadyExists()
            customer_data_dict["created_by"] = token["user"]["username"]
            new_customer = Customer(**customer_data_dict)
            session.add(new_customer)
            try:
                await session.commit()
                return new_customer
            except IntegrityError:
                await session.rollback()
            raise CustomerAlreadyExists()

    async def customer_next_code(self, session: AsyncSession):
        statement = select(Customer.code).order_by(Customer.code.desc()).limit(1)
        result = await session.execute(statement)
        last_code = result.scalar()
        last_number = last_code[1:] if last_code else "0"
        next_code = int(last_number) + 1
        next_code = "C" + str(next_code).zfill(4)
        return next_code

    async def check_customer_name_available(
        self, name: str, session: AsyncSession
    ) -> bool:
        statement = select(Customer).where(Customer.name == name)
        result = await session.execute(statement)
        existing_name = result.scalar()
        if existing_name:
            return True
        return False

    async def list_customer_names(self, session: AsyncSession):
        statement = select(Customer.name).order_by(Customer.name)
        result = await session.execute(statement)
        names = result.scalars().all()
        return names

    async def get_customer_by_code(self, code: str, session: AsyncSession):
        # format code to C____
        if len(code) != 5:
            code = "C" + code.zfill(4)
        if not code.startswith("C") or not code[1:].isdigit():
            raise IncorrectCodeFormat()
        statement = select(Customer).where(Customer.code == code)
        result = await session.execute(statement)
        customer = result.scalars().first()
        if customer:
            return customer
        else:
            raise CustomerNotFound()

    async def get_customer_by_name(self, name: str, session: AsyncSession):
        statement = select(Customer).where(Customer.name == name)
        result = await session.execute(statement)
        customer = result.scalars().first()
        if customer:
            return customer
        else:
            raise CustomerNotFound()

    async def update_customer(
        self, code: str, customer: UpdateCustomer, session: AsyncSession, token: dict
    ):
        existing_customer = await self.get_customer_by_code(code, session)
        if existing_customer.name != customer.name:
            raise CannotChangeCustomerName()
        for key, value in customer.model_dump().items():
            setattr(existing_customer, key, value)
        existing_customer.updated_by = token["user"]["username"]
        try:
            await session.commit()
        except:
            await session.rollback()
            raise CustomerAlreadyExists()
        await session.refresh(existing_customer)
        return existing_customer