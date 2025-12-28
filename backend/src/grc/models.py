from datetime import date
import sqlalchemy.dialects.postgresql as pg
from sqlmodel import Column, Field, SQLModel, ForeignKey


class GRC(SQLModel, table=True):
    __tablename__ = "grc"

    spare_code: str = Field(
        sa_column=Column(pg.VARCHAR(30), primary_key=True)
    )
    division: str = Field(
        sa_column=Column(pg.VARCHAR(20), nullable=False)
    )

    grc_no: int = Field(
        sa_column=Column(pg.INTEGER, nullable=False)
    )
    grc_date: date = Field(
        sa_column=Column(pg.DATE, nullable=False)
    )
    spare_description: str = Field(
        sa_column=Column(pg.VARCHAR(40), nullable=False)
    )
    issue_qty: int = Field(
        sa_column=Column(pg.INTEGER, nullable=False)
    )
    grc_pending_qty: int = Field(
        sa_column=Column(pg.INTEGER, nullable=False)
    )
    good_qty: int = Field(
        sa_column=Column(pg.INTEGER, nullable=True)
    )
    defective_qty: int = Field(
        sa_column=Column(pg.INTEGER, nullable=True)
    )
    returned_qty: int = Field(
        sa_column=Column(pg.INTEGER, nullable=True)
    )
    returning_qty: int = Field(
        sa_column=Column(pg.INTEGER, nullable=True)
    )
    actual_pending_qty: int = Field(
        sa_column=Column(pg.INTEGER, nullable=True)
    )
    due_qty: int = Field(
        sa_column=Column(pg.INTEGER, nullable=True)
    )
    dispute_remark: str = Field(
        sa_column=Column(pg.VARCHAR(40), nullable=True)
    )
    remark: str = Field(
        sa_column=Column(pg.VARCHAR(40), nullable=True)
    )
    challan_number: str = Field(
        sa_column=Column(pg.VARCHAR(10), nullable=True)
    )
    challan_date: date = Field(
        sa_column=Column(pg.DATE, nullable=True)
    )
    received_date: date = Field(
        sa_column=Column(pg.DATE, nullable=True)
    )
    received_by: str = Field(
        sa_column=Column(pg.VARCHAR(30), ForeignKey("employees.name"), nullable=True)
    )
    docket_number: str = Field(
        sa_column=Column(pg.VARCHAR(8), nullable=True)
    )
    sent_through: str = Field(
        sa_column=Column(pg.VARCHAR(20), nullable=True)
    )
    challan_by: str = Field(
        sa_column=Column(pg.VARCHAR(30), ForeignKey("employees.name"), nullable=False)
    )
    status: str = Field(
        sa_column=Column(pg.VARCHAR(10), nullable=False)
    )
    updated_by: str = Field(
        sa_column=Column(
            pg.VARCHAR(30),
            ForeignKey("users.username"),
            nullable=True,
        )
    )


    def __repr__(self):
        return f"<GRC {self.spare_code}>"
