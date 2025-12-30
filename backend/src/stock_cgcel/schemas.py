from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field
from sqlalchemy import Column


class StockCGCELSchema(BaseModel):
    spare_code: str = Field(..., max_length=30)
    division: Optional[str] = Field(None, max_length=20)
    spare_description: Optional[str] = Field(None, max_length=40)
    cnf_qty: Optional[int] = None
    grc_qty: Optional[int] = None
    own_qty: Optional[int] = None
    alp: Optional[float] = None
    purchase_price: Optional[float] = None
    discount: Optional[float] = None
    sale_price: Optional[float] = None
    gst_price: Optional[float] = None
    gst_rate: Optional[float] = None
    msl_qty: Optional[int] = None
    indent_qty: Optional[int] = None


class StockCGCELEnquiry(BaseModel):
    spare_code: str
    division: str
    spare_description: str
    division: str
    cnf_qty: Optional[int]
    grc_qty: Optional[int]
    own_qty: Optional[int]
    sale_price: Optional[float]


class StockCGCELEnquiryStockList(BaseModel):
    spare_code: str
    spare_description: str


class StockCGCELCreateIndentResponse(BaseModel):
    spare_code: str
    spare_description: str
    cnf_qty: Optional[int]
    grc_qty: Optional[int]
    own_qty: Optional[int]
    indent_qty: Optional[int]
    party_name: Optional[str]
    order_number: Optional[str]
    order_date: Optional[date]
    remark: Optional[str]


class StockCGCELCode(BaseModel):
    spare_code: str


class StockCGCELDescription(BaseModel):
    spare_description: str


class StockCGCELIndentCreate(BaseModel):
    indent_qty: int
    party_name: str
    order_number: str
    order_date: date
    remark: str


class StockCGCELUpdate(BaseModel):
    spare_code: str = Field(..., max_length=30)
    division: str = Field(..., max_length=20)
    spare_description: str = Field(..., max_length=40)
    movement_type: str = Field(..., max_length=10)
    own_qty: int
    remark: str = Field(..., max_length=40)


class StockCGCELGenerateIndentResponse(BaseModel):
    spare_code: str
    spare_description: str
    indent_qty: int


class StockCGCELGenerateIndentRecord(BaseModel):
    indent_number: str
    division: str
    spare_code: List[str]


class StockCGCELIndentEnquiry(BaseModel):
    spare_code: str
    division: str
    spare_description: str
    indent_qty: int
    indent_number: str
    indent_date: date
    party_name: Optional[str]
