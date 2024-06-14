# database.py에서 연결한 db를 테이블과 매핑시키는 역할

from sqlalchemy import *
from .database import Base

class Test(Base):
    __tablename__ = "iam"

    

    