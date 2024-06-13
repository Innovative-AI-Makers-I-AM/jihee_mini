from fastapi import APIRouter, File, UploadFile, HTTPException
import os
import json
import cv2
import numpy as np
from utils.face import face_app, calculate_face_similarity

from database import session, User

router = APIRouter()

@router.post("/identify_user/")
async def identify_user(file: UploadFile = File(...)):
    '''사용자 인식 엔드포인트'''
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
    max_similarity = 0.6    # 유사도의 초기 최대값 설정
    identified_user = None


    # 사용자 데이터 조회
    users = session.query(User).all()
    for user in users:
        # print(f"ID: {user.id}, Name: {user.name}, Embedding: {json.loads(user.embedding)}")
        savedEmbedding = json.loads(user.embedding)
        similarity = calculate_face_similarity(np.array(savedEmbedding), target_embedding)
        # 더 높은 유사도를 찾으면 최대 유사도와 해당 사용자 데이터 업데이트
        if similarity > max_similarity:
            max_similarity = similarity
            identified_user = {"name": user.name, "embedding": savedEmbedding}

    # 유사도가 높은 사용자를 찾으면 사용자 이름과 유사도 반환
    if identified_user:
        return {"name": identified_user["name"], "similarity": max_similarity}


    # 매칭되는 사용자를 찾지 못한 경우 예외 발생
    raise HTTPException(status_code=404, detail="No matching user found")
