from pydantic import BaseModel
from typing import List

class UserBase(BaseModel):
    name: str
    embeddings: List[float]

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int

    class Config:
        orm_mode = True
