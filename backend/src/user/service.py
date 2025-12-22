from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy.future import select

from auth.models import User
from auth.utils import generate_hash_password, verify_password
from exceptions import CannotDeleteCurrentUser, InvalidCredentials, UserNotFound
from user.schema import UserChangePassword, UserCreate


class UserService:

    async def list_users(self, session: AsyncSession):
        statement = select(User).where(User.is_active == "Y")
        result = await session.execute(statement)
        return result.scalars().all()

    async def list_standard_users(self, session: AsyncSession):
        statement = select(User).where((User.is_active == "Y") & (User.role == "USER"))
        result = await session.execute(statement)
        return result.scalars().all()

    async def create_user(self, session: AsyncSession, user: UserCreate):
        user.username = user.username.strip()
        user.username = " ".join(user.username.split())
        user_data_dict = user.model_dump()
        new_user = User(**user_data_dict)
        new_user.password = generate_hash_password(user_data_dict["password"])
        session.add(new_user)
        try:
            await session.commit()
        except:
            await session.rollback()
            raise IntegrityError()
        return new_user

    async def user_exists(self, username: str, session: AsyncSession) -> bool:
        existing_user = await self.get_user_by_username(username, session)
        return existing_user is not None

    async def get_user_by_username(self, username: str, session: AsyncSession):
        username = username.strip()
        username = " ".join(username.split())
        statement = select(User).where(
            User.username.ilike(username), User.is_active == "Y"
        )
        result = await session.execute(statement)
        return result.scalars().first()

    async def delete_user(self, username: str, session: AsyncSession, token: dict):
        user_to_delete = await self.get_user_by_username(username, session)
        if not user_to_delete:
            raise UserNotFound()
        if token["user"]["username"] == username:
            raise CannotDeleteCurrentUser()
        user_to_delete.is_active = "N"
        session.add(user_to_delete)
        await session.commit()

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
