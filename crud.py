from sqlalchemy.orm import Session
from models.user import User
from datetime import datetime
import json

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def check_in_user(db: Session, user_id: int):
    user = get_user(db, user_id)
    user.is_checked_in = True
    user.check_in_time = datetime.now()
    db.commit()
    db.refresh(user)
    return user

def check_out_user(db: Session, user_id: int):
    user = get_user(db, user_id)
    user.check_out_time = datetime.now()
    user.is_checked_in = False
    db.commit()
    db.refresh(user)
    return user

def leave_user(db: Session, user_id: int):
    user = get_user(db, user_id)
    leave_times = json.loads(user.leave_times or "[]")
    leave_times.append(datetime.now().isoformat())
    user.leave_times = json.dumps(leave_times)
    db.commit()
    db.refresh(user)
    return user

def return_user(db: Session, user_id: int):
    user = get_user(db, user_id)
    return_times = json.loads(user.return_times or "[]")
    return_times.append(datetime.now().isoformat())
    user.return_times = json.dumps(return_times)
    db.commit()
    db.refresh(user)
    return user
