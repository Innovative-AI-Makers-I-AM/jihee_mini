from fastapi import APIRouter, Form, Request, Depends, HTTPException, UploadFile, File
from fastapi.responses import HTMLResponse
import base64
import os
import json
import cv2
import numpy as np
from utils.face import face_app
from fastapi.templating import Jinja2Templates
from datetime import datetime
from utils.time_utils import calculate_total_work_time
from dependencies import get_current_user 
from sqlalchemy.orm import Session
from crud import check_in_user, check_out_user, leave_user, return_user
from database import get_db
from models.user import User
from fastapi import APIRouter, Depends, HTTPException
import models, schemas
from pydantic import BaseModel

router = APIRouter()

templates = Jinja2Templates(directory="templates")

class UserCreate(BaseModel):
    name: str
    embeddings: list

@router.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    '''회원가입 페이지로 접근 시 register.html 템플릿 렌더링'''
    return templates.TemplateResponse("register.html", {"request": request})

@router.post("/register/")
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(name=user.name, embeddings=user.embeddings)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/upload-json/")
async def upload_json(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    data = json.loads(content)
    user = UserCreate(name=data['name'], embeddings=data['embeddings'])
    return await create_user(user, db)

@router.post("/register_user/")
async def register_user(name: str = Form(...), front_image: str = Form(...), left_image: str = Form(...), right_image: str = Form(...)):
    """회원가입 처리 엔드포인트"""

    # 중복되는 사용자 이름이 있는지 확인
    user_names = [file_name.split('.')[0] for file_name in os.listdir('data/users')]
    user_name = name
    suffix = ""
    while user_name + suffix in user_names:
        if not suffix:
            suffix = "A"
        else:
            suffix = chr(ord(suffix) + 1)
            if suffix > "Z":
                suffix = "A" + chr(ord(suffix) + 1)
    
    user_name += suffix
    
    os.makedirs(f'data/users/{user_name}', exist_ok=True)
    images = [front_image, left_image, right_image]
    embeddings = []

    # 각 이미지를 디코딩하여 저장 및 임베딩 생성
    for i, image in enumerate(images, start=1):
        image_data = base64.b64decode(image.split(",")[1])
        img = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)
        faces = face_app.get(img)
        
        if not faces:
            raise HTTPException(status_code=400, detail="No face detected in one of the images")

        embeddings.append(faces[0].normed_embedding.tolist())
        
        image_path = f'data/users/{user_name}/image{i}.png'
        with open(image_path, "wb") as f:
            f.write(image_data)

    user_data = {"name": user_name, "embeddings": embeddings}
    user_file = f"data/users/{user_name}.json"
    with open(user_file, 'w') as f:
        json.dump(user_data, f)

    return {"message": "성공적으로 등록되었습니다."}

def check_attendance(user: User = Depends(get_current_user)):
    if not user.is_checked_in:
        raise HTTPException(status_code=400, detail="You must check-in first")

@router.post("/check-in")
def check_in(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.is_checked_in:
        raise HTTPException(status_code=400, detail="Already checked in")
    return check_in_user(db, user.id)

@router.post("/check-out", dependencies=[Depends(check_attendance)])
def check_out(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return check_out_user(db, user.id)

@router.post("/leave", dependencies=[Depends(check_attendance)])
def leave(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return leave_user(db, user.id)

@router.post("/return", dependencies=[Depends(check_attendance)])
def return_to_work(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return return_user(db, user.id)

@router.get("/work-time")
def get_work_time(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user.check_in_time or not user.check_out_time:
        raise HTTPException(status_code=400, detail="Incomplete work period")
    leave_times = json.loads(user.leave_times or "[]")
    return_times = json.loads(user.return_times or "[]")
    total_work_time = calculate_total_work_time(user.check_in_time, user.check_out_time, leave_times, return_times)
    return {"total_work_time": str(total_work_time)}
