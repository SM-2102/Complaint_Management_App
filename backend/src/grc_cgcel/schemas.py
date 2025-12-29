from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field
from sqlalchemy import Column


class GRCCGCELSchema(BaseModel):
    spare_code: str = Field(..., max_length=30)
    division: str = Field(..., max_length=20)
    spare_description: str = Field(..., max_length=40)
    grc_number: int
    grc_date: date
    issue_qty: int
    grc_pending_qty: int

# class GRCCGCELEnquiry(BaseModel):
#     spare_code: str
#     division: str
#     spare_description: str
#     cnf_qty: Optional[int]
#     grc_qty: Optional[int]
#     own_qty: Optional[int]
#     sale_price: Optional[float]


# class GRCCGCELEnquiryGRCList(BaseModel):
#     spare_code: str
#     spare_description: str


# class GRCCGCELCreateIndentResponse(BaseModel):
#     spare_code: str
#     spare_description: str
#     cnf_qty: Optional[int]
#     grc_qty: Optional[int]
#     own_qty: Optional[int]
#     indent_qty: Optional[int]
#     party_name: Optional[str]
#     order_number: Optional[str]
#     order_date: Optional[date]
#     remark: Optional[str]


# class GRCCGCELCode(BaseModel):
#     spare_code: str


# class GRCCGCELDescription(BaseModel):
#     spare_description: str


# class GRCCGCELIndentCreate(BaseModel):
#     indent_qty: int
#     party_name: str
#     order_number: str
#     order_date: date
#     remark: str


# class GRCCGCELUpdate(BaseModel):
#     spare_code: str = Field(..., max_length=30)
#     division: str = Field(..., max_length=20)
#     spare_description: str = Field(..., max_length=40)
#     movement_type: str = Field(..., max_length=10)
#     own_qty: int
#     remark: str = Field(..., max_length=40)


# class GRCCGCELGenerateIndentResponse(BaseModel):
#     spare_code: str
#     spare_description: str
#     indent_qty: int


# class GRCCGCELGenerateIndentRecord(BaseModel):
#     indent_number: str
#     division: str
#     spare_code: List[str]


# class GRCCGCELIndentEnquiry(BaseModel):
#     spare_code: str
#     division: str
#     spare_description: str
#     indent_qty: int
#     indent_number: str
#     indent_date: date
#     party_name: Optional[str]
