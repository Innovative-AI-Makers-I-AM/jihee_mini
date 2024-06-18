from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
import os
import json
import cv2
import numpy as np
from utils.face import face_app, calculate_face_similarity
# 가람추가
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import User

router = APIRouter()

@router.post("/identify_user/")
async def identify_user(file: UploadFile = File(...), db: Session = Depends(get_db)):
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
    # users_dir = "data/users"
    max_similarity = 0.6    # 유사도의 초기 최대값 설정
    identified_user = None

    # 저장된 사용자 데이터를 순회하며 유사도 비교

    users = db.query(User).all()
    if not users:
        raise HTTPException(status_code=404, detail="등록된 사용자가 없습니다.")
    
    for user in users:
        stored_embedding = np.frombuffer(user.embedding, dtype=np.float32).reshape(-1, 512)

        for embedding in stored_embedding:
            similarity = calculate_face_similarity(embedding, target_embedding)

        if similarity > max_similarity:
            max_similarity = similarity
            identified_user = user
    
    # 로그 출력
    print(f"Checking user: {user.name}")
    print(f"Stored Embedding: {embedding}")
    print(f"Target Embedding: {target_embedding}")
    print(f"Calculated Similarity: {similarity}")

    # for user_file in os.listdir(users_dir):
    #     if user_file.endswith(".json"):
    #         # 사용자 데이터 파일을 읽음
    #         with open(os.path.join(users_dir, user_file), 'r') as f:
    #             user_data = json.load(f)

    #         # 각 사용자 임베딩과 감지된 임베딩 간의 유사도 계산
    #         for embedding in user_data["embeddings"]:
    #             similarity = calculate_face_similarity(np.array(embedding), target_embedding)
    #             # 더 높은 유사도를 찾으면 최대 유사도와 해당 사용자 데이터 업데이트
    #             if similarity > max_similarity:
    #                 max_similarity = similarity
    #                 identified_user = user_data

    # 유사도가 높은 사용자를 찾으면 사용자 이름과 유사도 반환
    if identified_user:
        return {"name": identified_user.name, "user_id": identified_user.id, "similarity": max_similarity}
    
    # 확인용
    print("identify_user 함수 실행")

    # 매칭되는 사용자를 찾지 못한 경우 예외 발생
    raise HTTPException(status_code=404, detail="No matching user found")











# @router.post("/identify_user/")
# async def identify_user(file: UploadFile = File(...)):
#     '''사용자 인식 엔드포인트'''
#     # 업로드된 파일을 비동기적으로 읽음
#     image = await file.read()

#     # 이미지 데이터를 numpy 배열로 변환하고 OpenCV 형식으로 디코딩
#     img = cv2.imdecode(np.frombuffer(image, np.uint8), cv2.IMREAD_COLOR)

#     # 얼굴 인식 수행
#     faces = face_app.get(img)

#     # 얼굴을 감지하지 못한 경우 예외 발생
#     if not faces:
#         raise HTTPException(status_code=400, detail="얼굴이 인식되지 않았습니다. 다시 화면에 얼굴을 인식하세요.")

#     # 감지된 얼굴의 임베딩 추출
#     target_embedding = faces[0].normed_embedding
#     users_dir = "data/users"
#     max_similarity = 0.6    # 유사도의 초기 최대값 설정
#     identified_user = None

#     # 저장된 사용자 데이터를 순회하며 유사도 비교
#     for user_file in os.listdir(users_dir):
#         if user_file.endswith(".json"):
#             # 사용자 데이터 파일을 읽음
#             with open(os.path.join(users_dir, user_file), 'r') as f:
#                 user_data = json.load(f)

#             # 각 사용자 임베딩과 감지된 임베딩 간의 유사도 계산
#             for embedding in user_data["embeddings"]:
#                 similarity = calculate_face_similarity(np.array(embedding), target_embedding)
#                 # 더 높은 유사도를 찾으면 최대 유사도와 해당 사용자 데이터 업데이트
#                 if similarity > max_similarity:
#                     max_similarity = similarity
#                     identified_user = user_data

#     # 유사도가 높은 사용자를 찾으면 사용자 이름과 유사도 반환
#     if identified_user:
#         return {"name": identified_user["name"], "similarity": max_similarity}
    
#     # 확인용
#     print("identify_user 함수 실행")

#     # 매칭되는 사용자를 찾지 못한 경우 예외 발생
#     raise HTTPException(status_code=404, detail="No matching user found")
