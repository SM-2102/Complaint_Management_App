from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy.future import select

from exceptions import InvalidCredentials, UserNotFound

from .models import User
from .schemas import UserLogin
from .utils import verify_password


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
