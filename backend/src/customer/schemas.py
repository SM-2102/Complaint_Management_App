from typing import Optional

from pydantic import BaseModel, Field


class CreateCustomer(BaseModel):
    type: str = Field(..., min_length=3, max_length=10)
    name: str = Field(..., min_length=3, max_length=40)
    contact_person: Optional[str] = Field(None, max_length=30)
    address1: str = Field(..., max_length=40)
    address2: Optional[str] = Field(None, max_length=40)
    city: str = Field(..., max_length=30)
    pin: str = Field(..., pattern=r"^\d{6}$")
    contact1: str = Field(..., min_length=10, max_length=10, pattern=r"^\d{10}$")
    contact2: Optional[str] = Field(None, pattern=r"^\d{10}$")
    gst: Optional[str] = Field(None, pattern=r"^[A-Z0-9]{15}$")
    consignee_address1: str = Field(..., max_length=40)
    consignee_address2: Optional[str] = Field(None, max_length=40)
    consignee_city: str = Field(..., max_length=30)
    consignee_pin: str = Field(..., pattern=r"^\d{6}$")
    discount_fan: Optional[float]
    discount_cgfan: Optional[float]
    discount_sda: Optional[float]
    discount_cgsda: Optional[float]
    discount_lt: Optional[float]
    discount_fhp: Optional[float]
    discount_pump: Optional[float]
    discount_cgpump: Optional[float]
    discount_light: Optional[float]
    discount_whc: Optional[float]
    discount_cgwhc: Optional[float]
  

class CustomerResponse(CreateCustomer):
    code: str

class UpdateCustomer(CreateCustomer):
    pass


class CustomerCode(BaseModel):
    code: str


class CustomerName(BaseModel):
    name: str

class CustomerResponseForComplaint(BaseModel):
    address1: str
    address2: Optional[str]
    city: str
    pin: str
    contact1: str
    contact2: Optional[str]