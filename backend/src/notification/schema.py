from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


class NotificationCreate(BaseModel):
    details: str = Field(..., max_length=150)
    assigned_to: List[str]


class NotificationResponse(BaseModel):
    details: str
    assigned_to: str


class NotificationDetails(BaseModel):
    id: int
    details: str
