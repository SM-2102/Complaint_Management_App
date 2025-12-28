from typing import Optional

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
    sale_price: Optional[float] = None
    gst_price: Optional[float] = None
    gst_rate: Optional[float] = None
    msl_qty: Optional[int] = None
    indent_qty: Optional[int] = None
    
class StockCGPISLEnquiry(BaseModel):
    spare_code: str
    division: str
    spare_description: str
    cnf_qty: Optional[int]
    grc_qty: Optional[int]
    own_qty: Optional[int]
    sale_price: Optional[float]

class StockCGPISLEnquiryStockList(BaseModel):
    spare_code: str
    spare_description: str
   