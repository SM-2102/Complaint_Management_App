from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field
from sqlalchemy import Column


class ParameterSchema(BaseModel):
    financial_year: str = Field(..., max_length=4, min_length=4)
    invoice_date_unique: date
    invoice_no_unique: str = Field(..., max_length=5, min_length=5)
    invoice_date_smart: date
    invoice_no_smart: str = Field(..., max_length=5, min_length=5)
    invoicing_permission: str = Field(..., max_length=1, min_length=1)
    rfr_number: str = Field(..., max_length=10)