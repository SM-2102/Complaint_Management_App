from typing import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncEngine
from sqlalchemy.orm import sessionmaker
from sqlmodel import create_engine
from sqlmodel.ext.asyncio.session import AsyncSession

from config import Config

async_engine = AsyncEngine(
    create_engine(
        url=Config.DATABASE_URL_CONNECT,
        echo=False,
    )
)


async def get_session() -> AsyncIterator[AsyncSession]:
    Session = sessionmaker(
        bind=async_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with Session() as session:
        yield session
