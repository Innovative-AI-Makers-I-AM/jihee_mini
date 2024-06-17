from fastapi import APIRouter, Form, Request, HTTPException #, FastAPI, File, UploadFile
from fastapi.responses import HTMLResponse
import base64
import os
import json
import cv2
import numpy as np
from utils.face import face_app
# from utils.file import save_user_images
from fastapi.templating import Jinja2Templates
from db.database import add_user, session, User

router = APIRouter()

templates = Jinja2Templates(directory="templates")

@router.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    '''회원가입 페이지로 접근 시 register.html 템플릿 렌더링'''
    return templates.TemplateResponse("register.html", {"request": request})

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
            # chr() 함수는 ASCII 코드 값을 입력으로 받아 해당하는 문자를 반환하는 파이썬 내장 함수
            # ord() 함수는 문자를 입력으로 받아 해당하는 ASCII 코드 값을 반환
            suffix = chr(ord(suffix) + 1)
            if suffix > "Z":  # 알파벳이 모두 사용된 경우, 두 글자로 변환
                suffix = "A" + chr(ord(suffix) + 1)
    
    user_name += suffix
    
    os.makedirs(f'data/users/{user_name}', exist_ok=True)
    images = [front_image, left_image, right_image]
    embeddings = []

    # 각 이미지를 디코딩하여 저장 및 임베딩 생성
    for i, image in enumerate(images, start=1):
        # base64 인코딩된 이미지를 디코딩
        image_data = base64.b64decode(image.split(",")[1])
        
        # 저장된 이미지를 다시 읽어 OpenCV 형식으로 변환
        img = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)
        
        # 얼굴 인식을 수행
        faces = face_app.get(img)
        
        # 이미지에서 얼굴을 감지하지 못한 경우 예외 발생
        if not faces:
            raise HTTPException(status_code=400, detail="No face detected in one of the images")

        embeddings.append(faces[0].normed_embedding.tolist())
        
        # 디코딩된 이미지를 파일로 저장 (각도가 맞았을 때만 저장)
        image_path = f'data/users/{user_name}/image{i}.png'
        with open(image_path, "wb") as f:
            f.write(image_data)

    # user_data = {"name": user_name, "embeddings": embeddings}
    # user_file = f"data/users/{user_name}.json"
    # with open(user_file, 'w') as f:
    #     json.dump(user_data, f)
    add_user(user_name, embeddings)

    
# # # 사용자 데이터 조회
#     users = session.query(User).all()
#     for user in users:
#         print(f"ID: {user.id}, Name: {user.name}, Embedding: {json.loads(user.embedding)}")

    return {"message": "성공적으로 등록되었습니다."}
