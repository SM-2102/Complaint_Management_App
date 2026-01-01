from datetime import date

import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import Identity
from sqlmodel import Column, Field, ForeignKey, SQLModel


class GRCCGCEL(SQLModel, table=True):
    __tablename__ = "grc_cgcel"

    division: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=False))
    spare_code: str = Field(
        sa_column=Column(pg.VARCHAR(30), nullable=False, primary_key=True)
    )
    spare_description: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=False))
    grc_number: int = Field(
        sa_column=Column(pg.INTEGER, nullable=False, primary_key=True)
    )
    grc_date: date = Field(sa_column=Column(pg.DATE, nullable=False))
    issue_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=False))
    grc_pending_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=False))
    receive_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    good_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    defective_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    returned_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    returning_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    actual_pending_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    receive_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    dispute_remark: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))
    challan_number: str = Field(sa_column=Column(pg.VARCHAR(10), nullable=True))
    challan_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    docket_number: str = Field(sa_column=Column(pg.VARCHAR(8), nullable=True))
    sent_through: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=True))
    challan_by: str = Field(
        sa_column=Column(pg.VARCHAR(30), ForeignKey("users.username"), nullable=True)
    )
    status: str = Field(sa_column=Column(pg.VARCHAR(1), nullable=False, default="N"))
    damaged_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    short_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    alt_spare_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    alt_spare_code: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    invoice: str = Field(sa_column=Column(pg.CHAR(1), nullable=True), default="N")

    def __repr__(self):
        return f"<GRC {self.spare_code}>"


class GRCCGCELDispute(SQLModel, table=True):
    __tablename__ = "grc_cgcel_dispute"

    spare_code: str = Field(
        sa_column=Column(pg.VARCHAR(30), nullable=False, primary_key=True)
    )
    division: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=False))
    grc_number: int = Field(
        sa_column=Column(pg.INTEGER, nullable=False, primary_key=True)
    )
    grc_date: date = Field(sa_column=Column(pg.DATE, nullable=False))
    spare_description: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=False))
    issue_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=False))
    grc_pending_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=False))
    dispute_remark: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))
    damaged_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    short_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    alt_spare_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    alt_spare_code: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))

    def __repr__(self):
        return f"<GRCDispute {self.spare_code}>"


class GRCCGCELReturnHistory(SQLModel, table=True):
    __tablename__ = "grc_cgcel_return_history"

    id: int = Field(
        sa_column=Column(
            pg.INTEGER,
            Identity(always=False),
            primary_key=True,
        )
    )
    division: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=False))
    spare_code: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=False))
    spare_description: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=False))
    grc_number: int = Field(sa_column=Column(pg.INTEGER, nullable=False))
    grc_date: date = Field(sa_column=Column(pg.DATE, nullable=False))
    issue_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=False))
    grc_pending_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=False))
    good_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    defective_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    returning_qty: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    challan_number: str = Field(sa_column=Column(pg.VARCHAR(10), nullable=True))
    challan_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    docket_number: str = Field(sa_column=Column(pg.VARCHAR(8), nullable=True))
    sent_through: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=True))
    dispute_remark: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))
    challan_by: str = Field(
        sa_column=Column(pg.VARCHAR(30), ForeignKey("users.username"), nullable=False)
    )

    def __repr__(self):
        return f"<GRCReturnHistory {self.spare_code}>"
