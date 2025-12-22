from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy.future import select

from exceptions import InvalidCredentials, UserNotFound

from .models import User
from .schemas import UserLogin, UserChangePassword
from .utils import verify_password, generate_hash_password


class AuthService:

    async def login(self, user: UserLogin, session: AsyncSession) -> bool:
        existing_user = await self.get_user_by_username(user.username, session)
        if not existing_user:
            raise UserNotFound()
        if verify_password(user.password, existing_user.password):
            return existing_user
        raise InvalidCredentials()

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
