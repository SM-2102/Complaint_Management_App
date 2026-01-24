import sqlalchemy.dialects.postgresql as pg
from sqlmodel import Column, Field, SQLModel


class Parameter(SQLModel, table=True):
    __tablename__ = "parameter_last"

    name: str = Field(
        sa_column=Column(pg.VARCHAR(20), nullable=False, primary_key=True)
    )
    value: str = Field(sa_column=Column(pg.VARCHAR(10), nullable=False))
