import asyncio
from datetime import datetime, time, timedelta
from typing import Any

from sqlalchemy import extract
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy.future import select

from employee.models import Employee
from exceptions import InvalidCredentials, UserNotFound
from holiday.models import Holiday

from .models import User
from .schemas import UserChangePassword, UserCreate, UserLogin
from .utils import generate_hash_password, verify_password


class AuthService:

    async def login(self, user: UserLogin, session: AsyncSession) -> object:
        existing_user = await self.get_user_by_username(user.username, session)
        if not existing_user:
            raise UserNotFound()
        if not verify_password(user.password, existing_user.password):
            raise InvalidCredentials()

        today = datetime.now()
        # Prepare queries
        birthday_stmt = select(Employee.name).where(
            Employee.is_active == "Y",
            Employee.role != "ADMIN",
            extract("day", Employee.dob) == today.day,
            extract("month", Employee.dob) == today.month,
        )
        occasion_stmt = select(Holiday.name, Holiday.details).where(
            Holiday.holiday_date == today.date(), Holiday.is_holiday == "N"
        )

        # Run both queries concurrently
        birthday_task = session.execute(birthday_stmt)
        occasion_task = session.execute(occasion_stmt)
        birthday_result, occasion_result = await asyncio.gather(
            birthday_task, occasion_task
        )
        birthday_names = birthday_result.scalars().all()
        occasion_rows = occasion_result.all()

        holidays = []
        if occasion_rows:
            holidays = [{"name": row[0], "details": row[1]} for row in occasion_rows]
        else:
            # After 3 PM, try holiday for tomorrow
            if today.time() >= time(15, 0):
                tomorrow = today.date() + timedelta(days=1)
                holiday_stmt = select(Holiday.name, Holiday.details).where(
                    Holiday.holiday_date == tomorrow, Holiday.is_holiday == "Y"
                )
                holiday_result = await session.execute(holiday_stmt)
                holiday_rows = holiday_result.all()
                if holiday_rows:
                    holidays = [
                        {"name": row[0], "details": row[1]} for row in holiday_rows
                    ]

        return {
            "user": existing_user,
            "birthday_names": birthday_names,
            "holiday": holidays,
        }

    async def get_user_by_username(self, username: str, session: AsyncSession):
        # Normalize username spacing
        username = username.strip()
        username = " ".join(username.split())
        statement = select(User).where(
            User.username.ilike(username), User.is_active == "Y"
        )
        result = await session.execute(statement)
        return result.scalars().first()

    async def reset_password(
        self, user_data: UserChangePassword, session: AsyncSession
    ):
        existing_user = await self.get_user_by_username(user_data.username, session)
        if existing_user and verify_password(
            user_data.old_password, existing_user.password
        ):
            existing_user.password = generate_hash_password(user_data.new_password)
            session.add(existing_user)
            await session.commit()
            return existing_user
        raise InvalidCredentials()

    async def create_user(self, session: AsyncSession, user: Any):
        username = getattr(user, "name", None)
        user_data = {
            "username": username,
            "role": getattr(user, "role", None),
            "phone_number": getattr(user, "phone_number", None),
            "password": "123456",
        }
        new_user = User(**user_data)
        new_user.password = generate_hash_password(user_data["password"])
        session.add(new_user)
        try:
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        return new_user

    async def delete_user(self, username: str, session: AsyncSession):
        user_to_delete = await self.get_user_by_username(username, session)
        user_to_delete.is_active = "N"
        session.add(user_to_delete)
        await session.commit()
