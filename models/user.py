from sqlalchemy import Column, Integer, String, DateTime, Boolean
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    is_checked_in = Column(Boolean, default=False)
    check_in_time = Column(DateTime, nullable=True)
    check_out_time = Column(DateTime, nullable=True)
    leave_times = Column(String, nullable=True)
    return_times = Column(String, nullable=True)
