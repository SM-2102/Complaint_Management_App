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

class ComplaintFilterData(BaseModel):
    action_head: List[str] = []
    action_by: List[str] = []

class ComplaintEnquiryResponseSchema(BaseModel):
    complaint_number: str
    complaint_date: str
    complaint_time: time
    complaint_status: str
    customer_name: Optional[str]
    customer_contact1: Optional[str]
    customer_contact2: Optional[str]
    product_division: str
    current_status: str
    action_by: Optional[str]
    product_model: Optional[str]
    action_head: str

class ComplaintTechniciansReallocationSchema(BaseModel):
    complaint_number: str
    complaint_date: str
    customer_name: Optional[str]
    current_status: str
    product_division: str

class ComplaintReallocateRequestSchema(BaseModel):
    complaint_numbers: List[str]
    old_technician: str
    new_technician: str

class CreateComplaint(BaseModel):
    complaint_number: str = Field(..., max_length=15)
    complaint_head: str
    complaint_type: str
    complaint_priority: str
    action_head: str
    action_by: str
    technician: str
    customer_type: str
    customer_name: str = Field(..., max_length=40)
    customer_address1: str = Field(..., max_length=40)
    customer_address2: Optional[str] = Field(None, max_length=40)
    customer_city: str = Field(..., max_length=30)
    customer_pincode: str = Field(..., pattern=r"^\d{6}$")
    customer_contact1: str = Field(..., pattern=r"^\d{10}$")
    customer_contact2: Optional[str] = Field(None, pattern=r"^\d{10}$")
    product_division: str = Field(..., max_length=20)
    product_serial_number: Optional[str] = Field(None, max_length=20)
    product_model: Optional[str] = Field(None, max_length=25)
    current_status: str = Field(..., max_length=50)
    updated_time: Optional[str] = Field(None, max_length=7)
    appoint_date: Optional[date]
    
class ComplaintCreateData(BaseModel):
    complaint_number: str
    customer_name: List[str] = []
    action_head: List[str] = []
    action_by: List[str] = []
    technician: List[str] = []

class ComplaintUpdateData(BaseModel):
    complaint_number: List[str] = []
    customer_name: List[str] = []
    action_head: List[str] = []
    action_by: List[str] = []
    technician: List[str] = []

class ComplaintResponse(BaseModel):
    complaint_date: date
    product_division: str
    complaint_head: str
    product_model: Optional[str]
    product_serial_number: Optional[str]
    invoice_date: Optional[date]
    invoice_number: Optional[str]
    purchased_from: Optional[str]
    distributor_name: Optional[str]
    customer_name: str
    customer_address1: str
    customer_address2: Optional[str]
    customer_city: str
    customer_pincode: str
    customer_contact1: str
    customer_contact2: Optional[str]
    complaint_type: str
    complaint_status: str
    updated_time: Optional[str]
    current_status: str
    action_head: str
    action_by: str
    technician: Optional[str]
    complaint_priority: str
    spare_pending: str
    spare: Optional[str]
    indent_date: Optional[date]
    indent_so_number: Optional[str]
    indent_so_date: Optional[date]
    payment_collected: Optional[str]
    payment_mode: Optional[str]
    payment_details: Optional[str]
    amount_sc: Optional[float]
    amount_spare: Optional[float]
    final_status: str

class UpdateComplaint(BaseModel):
    product_division: str
    complaint_head: str
    product_model: Optional[str] = Field(None, max_length=25)
    product_serial_number: Optional[str] = Field(None, max_length=20)
    invoice_date: Optional[date] = Field(None)
    invoice_number: Optional[str] = Field(None, max_length=25)
    purchased_from: Optional[str] = Field(None, max_length=40)
    distributor_name: Optional[str] = Field(None, max_length=40)
    customer_name: str = Field(..., max_length=40)
    customer_address1: str = Field(..., max_length=40)
    customer_address2: Optional[str] = Field(None, max_length=40)
    customer_city: str = Field(..., max_length=30)
    customer_pincode: str = Field(..., pattern=r"^\d{6}$")
    customer_contact1: str = Field(..., pattern=r"^\d{10}$")
    customer_contact2: Optional[str] = Field(None, pattern=r"^\d{10}$")
    complaint_type: str
    updated_time: Optional[str] = Field(None, max_length=7)
    action_by: str
    complaint_status: str
    technician: str
    complaint_priority: str
    current_status: str = Field(..., max_length=50)
    action_head: str
    spare_pending: str = Field(..., max_length=1)
    spare: Optional[str] = Field(None, max_length=30)
    indent_date: Optional[date]
    indent_so_number: Optional[str] = Field(None, max_length=20)
    indent_so_date: Optional[date]
    payment_collected: Optional[str] = Field(None, max_length=1)
    payment_mode: Optional[str] = Field(None, max_length=10)
    payment_details: Optional[str] = Field(None, max_length=40)
    amount_sc: Optional[float]
    amount_spare: Optional[float]
    final_status: str = Field(..., max_length=1)

class EmailSchema(BaseModel):
    name: str
    email: str
    