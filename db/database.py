from sqlalchemy import create_engine, Column, Integer, String, Sequence, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import json

Base = declarative_base()

# User 테이블 정의
class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, Sequence('user_id_seq'), primary_key=True)
    name = Column(String(50))
    embedding = Column(String)

    # Attendance와의 일대다 관계 정의
    attendances = relationship("Attendance", back_populates="user")


# 입퇴실관리 테이블 정의
class Attendance(Base):
    __tablename__ = 'attendance'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'))
    date = Column(String)  # DateTime 대신 String 사용
    entry_time = Column(String)
    exit_time = Column(String)
    return_time = Column(String)
    leave_time = Column(String)

    user = relationship("User", back_populates="attendances")


# SQLite 데이터베이스 생성
engine = create_engine('sqlite:///C:/Users/user/miniprj/jihee_mini/db/db.sqlite')   # 파일에 저장
# engine = create_engine("sqlite+pysqlite:///:memory:", echo=True)  메모리에 저장

# 테이블 생성
Base.metadata.create_all(engine)

# 세션 생성
Session = sessionmaker(bind=engine)
session = Session()

# 사용자 데이터 추가 함수
def add_user(name, embeddings):
    # embedding을 JSON 문자열로 변환하여 저장
    embedding_str = json.dumps(embeddings)
    
    new_user = User(name=name, embedding=embedding_str)
    session.add(new_user)
    session.commit()
    

# 예제 사용자 데이터 추가
# embedding_data = [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]]
# add_user('John Doe', embedding_data)

# # 사용자 데이터 조회
# users = session.query(User).all()
# for user in users:
#     print(f"ID: {user.id}, Name: {user.name}, Embedding: {json.loads(user.embedding)}")


# 사용자의 입실 정보를 추가하는 함수
def add_attendance_entry(user_id):
    current_date = datetime.now().strftime('%y-%m-%d')  # '23-06-01' 형식
    entry_time = datetime.now().strftime('%H:%M:%S')  # '14:31:00' 형식
    
    new_attendance = Attendance(
        user_id=user_id,
        date=current_date,
        entry_time=entry_time,
        exit_time=None,
        return_time=None,
        leave_time=None
    )
    session.add(new_attendance)
    session.commit()


# 퇴실 시간 업데이트 함수
def update_exit_time(user_id):
    current_time = datetime.now().strftime('%H:%M:%S')
    attendance_record = session.query(Attendance).filter_by(user_id=user_id, date=datetime.now().strftime('%y-%m-%d')).order_by(Attendance.id.desc()).first()
    
    if attendance_record:
        attendance_record.exit_time = current_time
        session.commit()


# 복귀 시간 업데이트 함수
def update_return_time(user_id):
    current_time = datetime.now().strftime('%H:%M:%S')
    attendance_record = session.query(Attendance).filter_by(user_id=user_id, date=datetime.now().strftime('%y-%m-%d')).order_by(Attendance.id.desc()).first()
    
    if attendance_record:
        attendance_record.return_time = current_time
        session.commit()


# 외출 시간 업데이트 함수
def update_leave_time(user_id):
    current_time = datetime.now().strftime('%H:%M:%S')
    attendance_record = session.query(Attendance).filter_by(user_id=user_id, date=datetime.now().strftime('%y-%m-%d')).order_by(Attendance.id.desc()).first()
    
    if attendance_record:
        attendance_record.leave_time = current_time
        session.commit()