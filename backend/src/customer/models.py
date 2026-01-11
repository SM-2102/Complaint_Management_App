import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import ForeignKey
from sqlmodel import Column, Field, SQLModel


class Customer(SQLModel, table=True):
    __tablename__ = "customer"
    code: str = Field(primary_key=True, index=True)
    type: str = Field(sa_column=Column(pg.VARCHAR(10), nullable=False, default="CUSTOMER"))
    name: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=False, unique=True))
    contact_person: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    address1: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=False))
    address2: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))
    city: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=False))
    pin: str = Field(sa_column=Column(pg.VARCHAR(6), nullable=False))
    contact1: str = Field(sa_column=Column(pg.VARCHAR(10), nullable=True))
    contact2: str = Field(sa_column=Column(pg.VARCHAR(10), nullable=True))
    gst: str = Field(sa_column=Column(pg.VARCHAR(15), nullable=True))
    consignee_address1: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=False))
    consignee_address2: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))
    consignee_city: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=False))
    consignee_pin: str = Field(sa_column=Column(pg.VARCHAR(6), nullable=False))
    discount_fan: float = Field(
        sa_column=Column(pg.FLOAT, nullable=True)
    )
    discount_cgfan: float = Field(
        sa_column=Column(pg.FLOAT, nullable=True)
    )
    discount_sda: float = Field(
        sa_column=Column(pg.FLOAT, nullable=True)
    )
    discount_cgsda: float = Field(
        sa_column=Column(pg.FLOAT, nullable=True)
    )
    discount_cglt: float = Field(
        sa_column=Column(pg.FLOAT, nullable=True)
    )
    discount_cgfhp: float = Field(
        sa_column=Column(pg.FLOAT, nullable=True)
    )
    discount_pump: float = Field(
        sa_column=Column(pg.FLOAT, nullable=True)
    )
    discount_cgpump: float = Field(
        sa_column=Column(pg.FLOAT, nullable=True)
    )
    discount_light: float = Field(
        sa_column=Column(pg.FLOAT, nullable=True)
    )
    discount_whc: float = Field(
        sa_column=Column(pg.FLOAT, nullable=True)
    )
    discount_cgwhc: float = Field(
        sa_column=Column(pg.FLOAT, nullable=True)
    )
    created_by: str = Field(
        sa_column=Column(pg.VARCHAR(20), ForeignKey("users.username"), nullable=False)
    )
    updated_by: str = Field(
        sa_column=Column(pg.VARCHAR(20), ForeignKey("users.username"), nullable=True)
    )

    def __repr__(self):
        return f"<Customer {self.code} - {self.name}>"
