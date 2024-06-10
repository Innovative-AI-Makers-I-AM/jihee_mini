from fastapi import FastAPI, Form, HTTPException, Request, File, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os
import base64
import json
from typing import List
import numpy as np
import cv2
from insightface.app import FaceAnalysis

# FastAPI 애플리케이션 생성
app = FastAPI()

# Static 및 template 파일 설정
app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

# InsightFace 설정
face_app = FaceAnalysis(providers=['CPUExecutionProvider'])
face_app.prepare(ctx_id=0, det_size=(640, 640))

def calculate_face_similarity(feat1, feat2) -> float:
    # 두 얼굴 특징 벡터 간의 유사도를 계산하는 함수
    similarity = np.dot(feat1, feat2.T)
    return float(similarity)

@app.on_event("startup")
async def startup_event():
    # 애플리케이션 시작 시 'data/users' 디렉토리가 존재하는지 확인하고, 없으면 생성
    os.makedirs('data/users', exist_ok=True)

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    # 메인 페이지 렌더링
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    # 회원가입 페이지 렌더링
    return templates.TemplateResponse("register.html", {"request": request})

@app.post("/register_user/")
async def register_user(name: str = Form(...), image1: str = Form(...), image2: str = Form(...), image3: str = Form(...)):
    # 회원가입 처리: 사용자의 이름과 3개의 이미지를 받아서 등록
    # 사용자 폴더 생성
    os.makedirs(f'data/users/{name}', exist_ok=True)
    images = [image1, image2, image3]
    embeddings = []

    for i, image in enumerate(images, start=1):
        # Base64로 인코딩된 이미지를 디코딩
        image_data = base64.b64decode(image.split(",")[1])
        image_path = f'data/users/{name}/image{i}.png'
        with open(image_path, "wb") as f:
            f.write(image_data)
        
        # 이미지를 OpenCV 형식으로 변환
        img = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)
        faces = face_app.get(img)
        if not faces:
            raise HTTPException(status_code=400, detail="No face detected in one of the images")

        # 얼굴 특징 벡터를 리스트에 추가
        embeddings.append(faces[0].normed_embedding.tolist())

    # 사용자 데이터 저장
    user_data = {"name": name, "embeddings": embeddings}
    user_file = f"data/users/{name}.json"
    with open(user_file, 'w') as f:
        json.dump(user_data, f)

    return {"message": "User registered successfully."}

@app.post("/identify_user/")
async def identify_user(file: UploadFile = File(...)):
    # 사용자를 인식: 업로드된 이미지를 사용하여 등록된 사용자와 비교
    # 업로드된 이미지 읽기
    image = await file.read()
    # 이미지를 OpenCV 형식으로 변환
    img = cv2.imdecode(np.frombuffer(image, np.uint8), cv2.IMREAD_COLOR)
    faces = face_app.get(img)

    if not faces:
        raise HTTPException(status_code=400, detail="No face detected")

    # 업로드된 이미지의 특징 벡터 추출
    target_embedding = faces[0].normed_embedding
    users_dir = "data/users"
    max_similarity = 0.6  # 유사도의 초기값
    identified_user = None

    # 모든 사용자 파일을 탐색하며 유사도를 계산
    for user_file in os.listdir(users_dir):
        if user_file.endswith(".json"):
            with open(os.path.join(users_dir, user_file), 'r') as f:
                user_data = json.load(f)

            for embedding in user_data["embeddings"]:
                similarity = calculate_face_similarity(np.array(embedding), target_embedding)
                if similarity > max_similarity:
                    max_similarity = similarity
                    identified_user = user_data

    if identified_user:
        return {"name": identified_user["name"], "similarity": max_similarity}

    raise HTTPException(status_code=404, detail="No matching user found")

if __name__ == "__main__":
    # 애플리케이션 실행
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
