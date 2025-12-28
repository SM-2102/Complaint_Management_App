from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class EmployeeCreate(BaseModel):
    name: str = Field(
        min_length=3,
        max_length=30
    )
    dob: date
    phone_number: str = Field(
        min_length=10,
        max_length=10,
        pattern="^[0-9]{10}$"
    )
    address: str = Field(
        min_length=5
    )
    email: Optional[str] = Field(
        default=None,
        max_length=35,
        pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$"
    )
    aadhar: Optional[str] = Field(
        default=None,
        min_length=12,
        max_length=12,
        pattern="^[0-9]{12}$"
    )
    pan: Optional[str] = Field(
        default=None,
        min_length=10,
        max_length=10,
        pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
    )
    uan: Optional[str] = Field(
        default=None,
        max_length=20
    )
    pf_number: Optional[str] = Field(
        default=None,
        max_length=20
    )
    joining_date: date
    role: str = Field(
        default="TECHNICIAN",
        max_length=10
    )

class EmployeeResponse(BaseModel):
    name: str
    role: str
    phone_number: str

class EmployeeLeave(BaseModel):
    name: str
    leaving_date: date
