from datetime import date, time
from typing import List, Optional

from pydantic import BaseModel, Field
from sqlalchemy import Column


class ComplaintsSchema(BaseModel):
    
    complaint_number: str = Field(..., max_length=15)
    complaint_head: str = Field(..., max_length=10)
    complaint_date: date
    complaint_time: time
    complaint_type: str = Field(..., max_length=10)
    complaint_status: str = Field(..., max_length=15)
    complaint_priority: str = Field(..., max_length=15)
    action_head: str = Field(..., max_length=40)
    action_by: str = Field(..., max_length=30)
    technician: str = Field(..., max_length=30)
    customer_type: str = Field(..., max_length=20)
    customer_name: Optional[str] = Field(None, max_length=40)
    customer_address1: Optional[str] = Field(None, max_length=40)
    customer_address2: Optional[str] = Field(None, max_length=40)
    customer_city: Optional[str] = Field(None, max_length=30)
    customer_pincode: Optional[str] = Field(None, pattern=r"^\d{6}$")
    customer_contact1: str = Field(..., min_length=10, max_length=10, pattern=r"^\d{10}$")
    customer_contact2: Optional[str] = Field(None, pattern=r"^\d{10}$")
    product_division: str = Field(..., max_length=20)
    current_status: str = Field(..., max_length=50)
    spare_pending: str
    complaint_status: str
    created_by: str 
    final_status: str
