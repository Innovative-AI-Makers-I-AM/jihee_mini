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
from datetime import datetime

# FastAPI 애플리케이션 생성
app = FastAPI()

# 정적 파일 경로 설정
app.mount("/static", StaticFiles(directory="static"), name="static")

# 템플릿 경로 설정
templates = Jinja2Templates(directory="templates")

# 얼굴 분석을 위한 FaceAnalysis 객체 생성 및 준비
face_app = FaceAnalysis(providers=['CPUExecutionProvider'])
face_app.prepare(ctx_id=0, det_size=(640, 640))

def calculate_face_similarity(feat1, feat2) -> float:
    """얼굴 임베딩 간 유사도를 계산하는 함수"""
    similarity = np.dot(feat1, feat2.T)
    return float(similarity)

def check_image_angles(faces):
    """
    얼굴 이미지에서 얼굴 각도를 체크하는 함수
    """
    for face in faces:
        # 얼굴의 랜드마크 추출
        landmarks = face.landmark_2d_106
        
        # 왼쪽 눈, 오른쪽 눈, 코의 위치 추출
        left_eye = landmarks[38]
        right_eye = landmarks[88]
        nose = landmarks[54]
        
        # 눈 사이의 거리 계산
        dx = right_eye[0] - left_eye[0]
        dy = right_eye[1] - left_eye[1]
        
        # 눈 사이의 각도 계산 (라디안을 도로 변환)
        angle = np.arctan2(dy, dx) * 180 / np.pi
        
        # 각도를 기준으로 얼굴 방향 판단
        print(f"Angle: {angle}")  # 각도 값을 로그로 출력
        if -1 < angle < 2:
            return 'front'  # 정면
        elif angle <= -1:
            return 'left'   # 왼쪽
        elif angle >= 2:
            return 'right'  # 오른쪽
    return 'unknown'

@app.on_event("startup")
async def startup_event():
    """서버 시작 시 'data/users' 디렉토리 존재 여부를 확인하고, 없을 경우 생성"""
    os.makedirs('data/users', exist_ok=True)

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    """루트 경로로 접근 시 index.html 템플릿 렌더링"""
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    """회원가입 페이지로 접근 시 register.html 템플릿 렌더링"""
    return templates.TemplateResponse("register.html", {"request": request})

@app.post("/check_similarity/")
async def check_similarity(image: str = Form(...), previous_image: str = Form(None)):
    """이미지 유사도 검사 엔드포인트"""
    image_data = base64.b64decode(image.split(",")[1])
    img = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)
    faces = face_app.get(img)
    
    if not faces:
        raise HTTPException(status_code=400, detail="No face detected")

    current_embedding = faces[0].normed_embedding
    
    if previous_image:
        previous_image_data = base64.b64decode(previous_image.split(",")[1])
        previous_img = cv2.imdecode(np.frombuffer(previous_image_data, np.uint8), cv2.IMREAD_COLOR)
        previous_faces = face_app.get(previous_img)
        
        if not previous_faces:
            raise HTTPException(status_code=400, detail="No face detected in previous image")
        
        previous_embedding = previous_faces[0].normed_embedding
        similarity = calculate_face_similarity(current_embedding, previous_embedding)
        
        if similarity > 0.9:  # 임의로 유사도 0.9를 기준으로 설정
            return {"message": "Images are too similar", "similarity": similarity}
    
    return {"message": "Images are acceptable", "similarity": 0}


@app.post("/register_user/")
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
    angles = {'front': 0, 'left': 0, 'right': 0}

    # 각 이미지를 디코딩하여 저장 및 임베딩 생성
    for i, image in enumerate(images, start=1):
        # base64 인코딩된 이미지를 디코딩
        image_data = base64.b64decode(image.split(",")[1])
        
        # 디코딩된 이미지를 파일로 저장
        image_path = f'data/users/{user_name}/image{i}.png'
        with open(image_path, "wb") as f:
            f.write(image_data)
        
        # 저장된 이미지를 다시 읽어 OpenCV 형식으로 변환
        img = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)
        
        # 얼굴 인식을 수행
        faces = face_app.get(img)
        
        # 이미지에서 얼굴을 감지하지 못한 경우 예외 발생
        if not faces:
            raise HTTPException(status_code=400, detail="No face detected in one of the images")

        angle = check_image_angles(faces)
        print(f"Image {i}: {angle}")  # 각 이미지의 각도 값을 로그로 출력
        if angle == 'unknown':
            raise HTTPException(status_code=400, detail="Image angle could not be determined")
        angles[angle] += 1

        embeddings.append(faces[0].normed_embedding.tolist())

    if angles['front'] != 1 or angles['left'] != 1 or angles['right'] != 1:
        raise HTTPException(status_code=400, detail="Images must include front, left, and right sides")

    user_data = {"name": user_name, "embeddings": embeddings}
    user_file = f"data/users/{user_name}.json"
    with open(user_file, 'w') as f:
        json.dump(user_data, f)

    return {"message": "성공적으로 등록되었습니다."}


@app.post("/identify_user/")
async def identify_user(file: UploadFile = File(...)):
    """사용자 인식 엔드포인트"""
    # 업로드된 파일을 비동기적으로 읽음
    image = await file.read()
    
    # 이미지 데이터를 numpy 배열로 변환하고 OpenCV 형식으로 디코딩
    img = cv2.imdecode(np.frombuffer(image, np.uint8), cv2.IMREAD_COLOR)
    
    # 얼굴 인식 수행
    faces = face_app.get(img)

    # 얼굴을 감지하지 못한 경우 예외 발생
    if not faces:
        raise HTTPException(status_code=400, detail="얼굴이 인식되지 않았습니다. 다시 화면에 얼굴을 인식하세요.")

    # 감지된 얼굴의 임베딩 추출
    target_embedding = faces[0].normed_embedding
    users_dir = "data/users"
    max_similarity = 0.6  # 유사도의 초기 최대값 설정
    identified_user = None

    # #########가람 추가#########
    # # 현재 시간 확인
    # current_time = datetime.now()
    # current_hour = current_time.hour
    # #########가람 추가#########

    # 저장된 사용자 데이터를 순회하며 유사도 비교
    for user_file in os.listdir(users_dir):
        if user_file.endswith(".json"):
            # 사용자 데이터 파일을 읽음
            with open(os.path.join(users_dir, user_file), 'r') as f:
                user_data = json.load(f)

            # 각 사용자 임베딩과 감지된 임베딩 간의 유사도 계산
            for embedding in user_data["embeddings"]:
                similarity = calculate_face_similarity(np.array(embedding), target_embedding)
                # 더 높은 유사도를 찾으면 최대 유사도와 해당 사용자 데이터 업데이트
                if similarity > max_similarity:
                    max_similarity = similarity
                    identified_user = user_data

    # #########가람 추가#########
    # if identified_user:
    #     last_exit_time = identified_user.get("last_exit_time", None)
    #     last_entry_time = identified_user.get("last_entry_time", None)

    #     # 문자열을 datetime 객체로 변환
    #     if last_exit_time is not None:
    #         last_exit_time = datetime.fromisoformat(last_exit_time)
    #     if last_entry_time is not None:
    #         last_entry_time = datetime.fromisoformat(last_entry_time)

    #     # 현재 시간이 9시 이후 18시 이전인 경우 외출 또는 복귀로 처리
    #     if 9 < current_hour < 18:
    #         if last_exit_time is None or (last_entry_time and current_time > last_entry_time):
    #             # 외출로 처리
    #             identified_user["last_exit_time"] = current_time.isoformat()
    #             status = "외출"
    #         else:
    #             # 복귀로 처리
    #             identified_user["last_entry_time"] = current_time.isoformat()
    #             status = "복귀"
    #     else:
    #         # 9시 이전에는 출근으로 처리
    #         if current_hour <= 9:
    #             identified_user["last_entry_time"] = current_time.isoformat()
    #             status = "출근"
    #         # 18시 이후에는 퇴근으로 처리
    #         else:
    #             identified_user["last_exit_time"] = current_time.isoformat()
    #             status = "퇴근"
        
    #     # 사용자 데이터 업데이트
    #     user_file_path = os.path.join(users_dir, f"{identified_user['name']}.json")
    #     with open(user_file_path, 'w') as f:
    #         json.dump(identified_user, f)

    #     return {"name": identified_user["name"], "similarity": max_similarity, "status": status}
    # #########가람 추가#########

    # 유사도가 높은 사용자를 찾으면 사용자 이름과 유사도 반환
    if identified_user:
        return {"name": identified_user["name"], "similarity": max_similarity}

    # 매칭되는 사용자를 찾지 못한 경우 예외 발생
    raise HTTPException(status_code=404, detail="No matching user found")


# 애플리케이션 실행
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
