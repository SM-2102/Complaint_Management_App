from datetime import date
import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import Identity
from sqlmodel import Column, Field, SQLModel


class Employee(SQLModel, table=True):
    __tablename__ = "employees"

    id: int = Field(
        sa_column=Column(
            pg.INTEGER,
            Identity(always=False),
            primary_key=True,
        )
    )
    name: str = Field(
        sa_column=Column(pg.VARCHAR(30), nullable=False, unique=True)
    )
    dob: date = Field(
        sa_column=Column(pg.DATE, nullable=False)
    )
    phone_number: str = Field(
        sa_column=Column(pg.VARCHAR(10), nullable=False)
    )
    address: str = Field(
        sa_column=Column(pg.TEXT, nullable=False)
    )
    email: str = Field(
        sa_column=Column(pg.VARCHAR(50), nullable=True)
    )
    aadhar: str = Field(
        sa_column=Column(pg.VARCHAR(12), nullable=True)
    )
    pan: str = Field(
        sa_column=Column(pg.VARCHAR(10), nullable=True)
    )
    uan: str = Field(
        sa_column=Column(pg.VARCHAR(20), nullable=True)
    )
    pf_number: str = Field(
        sa_column=Column(pg.VARCHAR(20), nullable=True)
    )
    joining_date: date = Field(
        sa_column=Column(pg.DATE, nullable=False)
    )
    leaving_date: date = Field(
        sa_column=Column(pg.DATE, nullable=True)
    )
    role: str = Field(
        sa_column=Column(pg.VARCHAR(20), nullable=False, default="TECHNICIAN")
    )
    is_active: str = Field(
        sa_column=Column(pg.VARCHAR(1), nullable=False, default="Y")
    )

    def __repr__(self):
        return f"<Employee {self.name}>"
