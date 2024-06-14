# # database.py에서 연결한 db를 테이블과 매핑시키는 역할

# from sqlalchemy import *
# from sqlalchemy.orm import relationship
# from .database import Base

# class User(Base):
#     __tablename__ = "user"

#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String(255), nullable=False)
#     embedding = Column(BLOB)

#     managing = relationship("Managing", back_populates="user")

# class Managing(Base):
#     __tablename__ = "managing"

#     id = Column(Integer, primary_key=True, index=True, autoincrement=True)
#     user_id = Column(Integer, ForeignKey("user.id"))
#     date = Column(Date)
#     check_in = Column(Time)
#     out_time = Column(Time)
#     return_time = Column(Time)
#     check_out = Column(Time)

#     user = relationship("User", back_populates="managing")
