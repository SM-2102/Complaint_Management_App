from datetime import date

import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import Identity
from sqlmodel import Column, Field, ForeignKey, SQLModel


class StockCGCEL(SQLModel, table=True):
    __tablename__ = "stock_cgcel"

    spare_code: str = Field(
        sa_column=Column(pg.VARCHAR(30), primary_key=True, nullable=False)
    )
    division: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=False))
    spare_description: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=False))
    cnf_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True, index=True))
    grc_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True, index=True))
    own_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True, index=True))
    alp: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    sale_price: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    indent_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True, index=True))
    party_name: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    order_number: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    order_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    remark: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))
    hsn_code: str = Field(sa_column=Column(pg.VARCHAR(8), nullable=False))

    def __repr__(self):
        return f"<SpareCGCEL {self.spare_code}>"


class StockCGCELMovement(SQLModel, table=True):
    __tablename__ = "stock_cgcel_movement"
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
    movement_type: str = Field(sa_column=Column(pg.VARCHAR(10), nullable=False))
    own_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=False))
    remark: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=False))
    entry_date: date = Field(sa_column=Column(pg.DATE, nullable=False))
    created_by: str = Field(
        sa_column=Column(pg.VARCHAR(30), ForeignKey("users.username"), nullable=False)
    )

    def __repr__(self):
        return f"<SpareCGCELMovement {self.spare_code}>"


class StockCGCELIndent(SQLModel, table=True):
    __tablename__ = "stock_cgcel_indent"
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
    indent_date: date = Field(sa_column=Column(pg.DATE, nullable=False, index=True))
    indent_number: str = Field(sa_column=Column(pg.VARCHAR(6), nullable=False))
    party_name: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    order_number: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    order_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    remark: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))
    created_by: str = Field(
        sa_column=Column(pg.VARCHAR(30), ForeignKey("users.username"), nullable=False)
    )

    def __repr__(self):
        return f"<SpareCGCELIndent {self.spare_code}>"
