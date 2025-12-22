import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import Identity
from sqlmodel import Column, Field, SQLModel


class User(SQLModel, table=True):
    __tablename__ = "users"
    id: int = Field(
        sa_column=Column(
            pg.INTEGER,
            Identity(always=False),  # this makes id auto-increment in PostgreSQL
            primary_key=True,
        )
    )
    username: str = Field(unique=True)
    password: str = Field(exclude=True)
    role: str = Field(sa_column=Column(pg.VARCHAR, nullable=False, default="USER"))
    phone_number: str = Field(sa_column=Column(pg.VARCHAR, nullable=False))
    is_active: str = Field(sa_column=Column(pg.VARCHAR(1), nullable=False, default="Y"))

    def __repr__(self):
        return f"<User {self.username}>"
