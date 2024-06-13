from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from models.user import User
from database import get_db

def get_current_user(db: Session = Depends(get_db)):
    user_id = 1  # 실제 로그인 구현 시 수정 필요
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=400, detail="User not found")
    return user
