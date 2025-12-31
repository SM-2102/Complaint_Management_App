from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


class StockCGPISLSchema(BaseModel):
    spare_code: str = Field(..., max_length=30)
    division: str = Field(..., max_length=20)
    spare_description: str = Field(..., max_length=40)
    cnf_qty: Optional[int] = None
    grc_qty: Optional[int] = None
    own_qty: Optional[int] = None
    alp: Optional[float] = None
    purchase_price: Optional[float] = None
    discount: Optional[float] = None
    alp: Optional[float] = None
    gst_price: Optional[float] = None
    gst_rate: Optional[float] = None
    msl_qty: Optional[int] = None
    indent_qty: Optional[int] = None


class StockCGPISLEnquiry(BaseModel):
    spare_code: str
    division: str
    spare_description: str
    division: str
    cnf_qty: Optional[int]
    grc_qty: Optional[int]
    own_qty: Optional[int]
    alp: Optional[float]


class StockCGPISLEnquiryStockList(BaseModel):
    spare_code: str
    spare_description: str


class StockCGPISLCreateIndentResponse(BaseModel):
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


class StockCGPISLCode(BaseModel):
    spare_code: str


class StockCGPISLDescription(BaseModel):
    spare_description: str


class StockCGPISLIndentCreate(BaseModel):
    indent_qty: int
    party_name: str
    order_number: str
    order_date: date
    remark: str


class StockCGPISLGenerateIndentResponse(BaseModel):
    spare_code: str
    spare_description: str
    indent_qty: int


class StockCGPISLGenerateIndentRecord(BaseModel):
    indent_number: str
    division: str
    spare_code: List[str]


class StockCGPISLIndentEnquiry(BaseModel):
    spare_code: str
    division: str
    spare_description: str
    indent_qty: int
    indent_number: str
    indent_date: str
    party_name: Optional[str]
