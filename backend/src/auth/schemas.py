from pydantic import BaseModel, Field


class UserResponse(BaseModel):
    username: str
    role: str
    phone_number: str


class UserLogin(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)
