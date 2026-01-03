from datetime import date, time

import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import ForeignKey
from sqlmodel import Column, Field, SQLModel


class Complaint(SQLModel, table=True):
    __tablename__ = "complaints"

    # Primary identification
    complaint_number: str = Field(
        sa_column=Column(pg.VARCHAR(15), primary_key=True, nullable=False)
    )
    complaint_head: str = Field(sa_column=Column(pg.VARCHAR(10), nullable=False))
    complaint_date: date = Field(sa_column=Column(pg.DATE, nullable=False))
    complaint_time: time = Field(sa_column=Column(pg.TIME, nullable=False))

    # Complaint classification
    complaint_type: str = Field(sa_column=Column(pg.VARCHAR(10), nullable=False))
    complaint_status: str = Field(sa_column=Column(pg.VARCHAR(15), nullable=False))
    complaint_priority: str = Field(sa_column=Column(pg.VARCHAR(15), nullable=False))

    # Action details
    action_head: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=False))
    action_by: str = Field(
        sa_column=Column(
            pg.VARCHAR(30),
            ForeignKey("employees.name"),
            nullable=False,
        )
    )
    technician: str = Field(
        sa_column=Column(
            pg.VARCHAR(30),
            ForeignKey("employees.name"),
            nullable=True,
        )
    )

    # Customer details
    customer_type: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=False))
    dealer_code: str = Field(
        sa_column=Column(pg.VARCHAR(5), nullable=True)
    )
    customer_name: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))
    customer_address1: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))
    customer_address2: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))
    customer_city: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    customer_pincode: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    customer_contact1: int = Field(sa_column=Column(pg.BIGINT, nullable=True))
    customer_contact2: int = Field(sa_column=Column(pg.BIGINT, nullable=True))

    # Product details
    product_division: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=False))
    product_serial_number: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=True))
    product_model: str = Field(sa_column=Column(pg.VARCHAR(25), nullable=True))
    invoice_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    invoice_number: str = Field(sa_column=Column(pg.VARCHAR(25), nullable=True))
    purchased_from: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))
    distributor_name: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))

    # Spare details (up to 6)
    spare_pending: str = Field(sa_column=Column(pg.CHAR(1), nullable=False))

    spare1: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    qty1: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    indent_date1: date = Field(sa_column=Column(pg.DATE, nullable=True))

    spare2: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    qty2: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    indent_date2: date = Field(sa_column=Column(pg.DATE, nullable=True))

    spare3: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    qty3: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    indent_date3: date = Field(sa_column=Column(pg.DATE, nullable=True))

    spare4: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    qty4: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    indent_date4: date = Field(sa_column=Column(pg.DATE, nullable=True))

    spare5: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    qty5: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    indent_date5: date = Field(sa_column=Column(pg.DATE, nullable=True))

    spare6: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    qty6: int = Field(sa_column=Column(pg.INTEGER, nullable=True))
    indent_date6: date = Field(sa_column=Column(pg.DATE, nullable=True))

    # Status & replacement
    current_status: str = Field(sa_column=Column(pg.VARCHAR(50), nullable=False))
    rfr_number: str = Field(sa_column=Column(pg.VARCHAR(9), nullable=True))
    rfr_date: date = Field(sa_column=Column(pg.DATE, nullable=True))
    replacement_reason: str = Field(sa_column=Column(pg.VARCHAR(30), nullable=True))
    replacement_remark: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))

    indent_so_number: str = Field(sa_column=Column(pg.VARCHAR(20), nullable=True))
    indent_so_date: date = Field(sa_column=Column(pg.DATE, nullable=True))

    # Audit
    created_by: str = Field(
        sa_column=Column(
            pg.VARCHAR(30),
            ForeignKey("users.username"),
            nullable=False,
        )
    )
    updated_by: str = Field(
        sa_column=Column(
            pg.VARCHAR(30),
            ForeignKey("users.username"),
            nullable=True,
        )
    )
    updated_time: time = Field(sa_column=Column(pg.TIME, nullable=True))

    # Payment
    payment_collected: str = Field(sa_column=Column(pg.CHAR(1), nullable=True, default='N'))
    payment_mode: str = Field(sa_column=Column(pg.VARCHAR(10), nullable=True))
    payment_details: str = Field(sa_column=Column(pg.VARCHAR(40), nullable=True))
    amount_sc: float = Field(sa_column=Column(pg.FLOAT, nullable=True))
    amount_spare: float = Field(sa_column=Column(pg.FLOAT, nullable=True))

    # Final status
    final_status: str = Field(sa_column=Column(pg.CHAR(1), nullable=False, default='N'))

    def __repr__(self):
        return f"<Complaint {self.complaint_number}>"
