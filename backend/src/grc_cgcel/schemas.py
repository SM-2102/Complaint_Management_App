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


class GRCCGCELReceiveSchema(BaseModel):
    spare_code: str
    spare_description: str
    issue_qty: int
    division: str
    receive_qty: Optional[int]
    damaged_qty: Optional[int]
    short_qty: Optional[int]
    alt_spare_qty: Optional[int]
    alt_spare_code: Optional[str]
    dispute_remark: Optional[str]


class GRCCGCELUpdateReceiveSchema(BaseModel):
    spare_code: str
    grc_number: int
    receive_qty: Optional[int]
    damaged_qty: Optional[int]
    short_qty: Optional[int]
    alt_spare_qty: Optional[int]
    alt_spare_code: Optional[str]
    dispute_remark: Optional[str]


class GRCCGCELDisputeCreate(BaseModel):
    spare_code: str
    division: str
    grc_number: int
    grc_date: date
    spare_description: str
    issue_qty: int
    grc_pending_qty: int
    dispute_remark: Optional[str]
    damaged_qty: Optional[int]
    short_qty: Optional[int]
    alt_spare_qty: Optional[int]
    alt_spare_code: Optional[str]


class GRCCGCELReturnSchema(BaseModel):
    grc_number: int
    grc_date: str
    spare_code: str
    spare_description: str
    issue_qty: int
    grc_pending_qty: int
    actual_pending_qty: Optional[int]
    returned_qty: Optional[int]
    good_qty: Optional[int]
    defective_qty: Optional[int]
    invoice: Optional[str]
    docket_number: Optional[str]
    sent_through: Optional[str]


class GRCCGCELReturnSave(BaseModel):
    spare_code: str
    grc_number: int
    good_qty: Optional[int]
    defective_qty: Optional[int]
    invoice: str
    sent_through: Optional[str]
    docket_number: Optional[str]

class GRCCGCELFinalizeRow(BaseModel):
    spare_code: str
    grc_number: int
    good_qty: Optional[int]
    defective_qty: Optional[int]

class GRCCGCELReturnFinalizePayload(BaseModel):
    challan_number: str
    division: str
    sent_through: Optional[str]
    docket_number: Optional[str]
    grc_rows: List[GRCCGCELFinalizeRow]


class GRCRowPayload(BaseModel):
    grc_number: int
    grc_date: str
    spare_code: str
    spare_description: str
    actual_pending_qty: Optional[int]
    good_qty: Optional[int]
    defective_qty: Optional[int]


class GRCFullPayload(BaseModel):
    division: str
    challan_number: str
    sent_through: Optional[str]
    docket_number: Optional[str]
    grc_rows: List[GRCRowPayload]


class GRCCGCELHistorySchema(BaseModel):
    division: str
    spare_code: str
    spare_description: str
    grc_number: int
    grc_date: date
    issue_qty: int
    grc_pending_qty: int
    good_qty: Optional[int]
    defective_qty: Optional[int]
    returning_qty: Optional[int]
    challan_number: Optional[str]
    challan_date: Optional[date]
    docket_number: Optional[str]
    sent_through: Optional[str]
    remark: Optional[str]
    challan_by: Optional[str]

class GRCCGCELEnquiry(BaseModel):
    spare_code: str
    spare_description: str
    grc_number: int
    grc_date: str
    issue_qty: int
    grc_pending_qty: Optional[int]
    returning_qty: Optional[int]
    dispute_remark: Optional[str]
    challan_number: Optional[str]
    challan_date: Optional[str]
    docket_number: Optional[str]