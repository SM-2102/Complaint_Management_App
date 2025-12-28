from datetime import date
import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import Identity
from sqlmodel import Column, Field, ForeignKey, SQLModel


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: int = Field(
        sa_column=Column(
            pg.INTEGER,
            Identity(always=False),
            primary_key=True,
        )
    )
    details: str = Field(
        sa_column=Column(pg.TEXT, nullable=False)
    )
    assigned_to: str = Field(
        sa_column=Column(pg.VARCHAR(30), ForeignKey("employees.name"), nullable=False)
    )
    resolved: str = Field(
        sa_column=Column(pg.VARCHAR(1), nullable=False, default="N")
    )

    def __repr__(self):
        return f"<Notification {self.assigned_to}>"