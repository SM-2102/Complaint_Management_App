import sqlalchemy.dialects.postgresql as pg
from sqlmodel import Column, Field, SQLModel


class SpareCGCEL(SQLModel, table=True):
    __tablename__ = "spare_cgcel"

    spare_code: str = Field(
        sa_column=Column(pg.VARCHAR(30), primary_key=True, nullable=False)
    )
    division: str = Field(
        sa_column=Column(pg.VARCHAR(20), nullable=False)
    )
    spare_description: str = Field(
        sa_column=Column(pg.VARCHAR(40), nullable=False)
    )
    qty: int = Field(
        sa_column=Column(pg.INTEGER, nullable=True)
    )
    msl_qty: int = Field(
        sa_column=Column(pg.INTEGER, nullable=True)
    )
    indent_qty: int = Field(
        sa_column=Column(pg.INTEGER, nullable=True)
    )
    alp: float = Field(
        sa_column=Column(pg.FLOAT, nullable=True)
    )
    purchase_price: float = Field(
        sa_column=Column(pg.FLOAT, nullable=True)
    )
    sale_price: float = Field(
        sa_column=Column(pg.FLOAT, nullable=True)
    )

    def __repr__(self):
        return f"<SpareCGCEL {self.spare_code}>"
