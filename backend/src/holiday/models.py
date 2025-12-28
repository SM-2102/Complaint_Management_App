from datetime import date
import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import Identity
from sqlmodel import Column, Field, SQLModel


class Holiday(SQLModel, table=True):
    __tablename__ = "holidays"

    id: int = Field(
        sa_column=Column(
            pg.INTEGER,
            Identity(always=False),
            primary_key=True,
        )
    )
    name: str = Field(
        sa_column=Column(pg.VARCHAR(30), nullable=False)
    )
    details: str = Field(
        sa_column=Column(pg.TEXT, nullable=False)
    )
    holiday_date: date = Field(
        sa_column=Column(pg.DATE, nullable=False))
    is_holiday: str = Field(
        sa_column=Column(pg.CHAR(1), nullable=False, default='Y'))

    def __repr__(self):
        return f"<Holiday {self.name}>"