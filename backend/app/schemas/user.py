
from pydantic import BaseModel
from datetime import datetime

class UserBase(BaseModel):
    email: str
    first_name: str
    last_name: str
    phone_number: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
