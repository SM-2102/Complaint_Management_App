import sqlalchemy.dialects.postgresql as pg
from sqlmodel import Column, Field, Identity, SQLModel


class Parameter(SQLModel, table=True):
    __tablename__ = "parameter_last"

    id: int = Field(
        sa_column=Column(
            pg.INTEGER,
            Identity(always=False),
            primary_key=True,
        )
    )
    financial_year: str = Field(
        sa_column=Column(pg.VARCHAR(length=4), nullable=False)
    )
    invoice_date_smart: str = Field(
        sa_column=Column(pg.DATE, nullable=False)
    )
    invoice_date_unique: str = Field(
        sa_column=Column(pg.DATE, nullable=False)
    )
    invoice_no_smart: str = Field(
        sa_column=Column(pg.VARCHAR(length=5), nullable=False)
    )
    invoice_no_unique: str = Field(
        sa_column=Column(pg.VARCHAR(length=5), nullable=False)
    )
    invoicing_permission: str = Field(
        sa_column=Column(pg.VARCHAR(length=1), nullable=False)
    )
    rfr_number: str = Field(
        sa_column=Column(pg.VARCHAR(length=10), nullable=False)
    )
 