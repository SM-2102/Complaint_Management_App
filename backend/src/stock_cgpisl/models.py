from datetime import date

import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import Identity
from sqlmodel import Column, Field, ForeignKey, SQLModel


class StockCGPISL(SQLModel, table=True):
    __tablename__ = "stock_cgpisl"

    spare_code: str = Field(
        sa_column=Column(pg.VARCHAR(30), primary_key=True, nullable=False)
    )
    division: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=False))
    spare_description: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=False))
    cnf_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True, index=True))
    grc_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True, index=True))
    own_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True, index=True))
    alp: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    indent_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True, index=True))
    party_name: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    order_number: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    order_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    remark: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))
    hsn_code: str = Field(sa_column=Column(pg.VARCHAR(8), nullable=False))


    def __repr__(self):
        return f"<SpareCGPISL {self.spare_code}>"



class StockCGPISLIndent(SQLModel, table=True):
    __tablename__ = "stock_cgpisl_indent"
    id: int = Field(
        sa_column=Column(
            pg.INTEGER,
            Identity(always=False),  # this makes id auto-increment in PostgreSQL
            primary_key=True,
        )
    )
    spare_code: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=False))
    division: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=False))
    spare_description: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=False))
    indent_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=False))
    indent_date: date = Field(sa_column=Column(pg.DATE, nullable=False))
    indent_number: str = Field(sa_column=Column(pg.VARCHAR(6), nullable=False))
    party_name: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    order_number: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    order_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    remark: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))
    created_by: str = Field(
        sa_column=Column(pg.VARCHAR(30), ForeignKey("users.username"), nullable=False)
    )

    def __repr__(self):
        return f"<SpareCGPISLIndent {self.spare_code}>"
