from fastapi import APIRouter, Form, HTTPException, Depends
import base64
import cv2
import numpy as np
from utils.face import face_app, calculate_face_similarity
# 가람추가
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import User

router = APIRouter()

# # 가람추가
# @router.post("/check_similarity/")
# async def check_similarity(image: str = Form(...), name: str = Form(...), db: Session = Depends(get_db)):
#     image_data = base64.b64decode(image.split(",")[1])
#     img = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)
#     faces = face_app.get(img)

#     if not faces:
#         raise HTTPException(status_code=400, detail="No face detected")

#     current_embedding = faces[0].normed_embedding

#     user = db.query(User).filter(User.name == name).first()

#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
    
#     stored_embedding = np.frombuffer(user.embedding, dtype=np.float32)
#     similarity = calculate_face_similarity(current_embedding, stored_embedding)

#     # 로그 출력
#     print("❤")
#     print(f"Curren Embedding : {current_embedding}")
#     print(f"Stored Embedding for {name}: {stored_embedding}")
#     print(f"Calculated Similarity: {similarity}")

#     # if previous_image:
#     #     previous_image_data = base64.b64decode(previous_image.split(",")[1])
#     #     previous_img = cv2.imdecode(np.frombuffer(previous_image_data, np.uint8), cv2.IMREAD_COLOR)
#     #     previous_faces = face_app.get(previous_img)

#     #     if not previous_faces:
#     #         raise HTTPException(status_code=400, detail="No face detected in previous image")

#     #     previous_embedding = previous_faces[0].normed_embedding
#     #     similarity = calculate_face_similarity(current_embedding, previous_embedding)

#     #     if similarity > 0.9:
#     #         return {"message": "Images are too similar", "similarity": similarity}

#     return {"message": "Images are acceptable", "similarity": similarity}


@router.post("/check_similarity/")
async def check_similarity(image: str = Form(...), previous_image: str = Form(None)):
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

        if similarity > 0.9:
            return {"message": "Images are too similar", "similarity": similarity}

    return {"message": "Images are acceptable", "similarity": 0}



# @router.post("/check_similarity/")
# async def check_similarity(image: str = Form(...), previous_image: str = Form(None)):
#     '''이미지 유사도 검사 엔드포인트'''
#     image_data = base64.b64decode(image.split(",")[1])
#     img = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)
#     faces = face_app.get(img)

#     if not faces:
#         raise HTTPException(status_code=400, detail="No face detected")

#     current_embedding = faces[0].normed_embedding

#     if previous_image:
#         previous_image_data = base64.b64decode(previous_image.split(",")[1])
#         previous_img = cv2.imdecode(np.frombuffer(previous_image_data, np.uint8), cv2.IMREAD_COLOR)
#         previous_faces = face_app.get(previous_img)

#         if not previous_faces:
#             raise HTTPException(status_code=400, detail="No face detected in previous image")

#         previous_embedding = previous_faces[0].normed_embedding
#         similarity = calculate_face_similarity(current_embedding, previous_embedding)

#         if similarity > 0.9:    # 임의로 유사도 0.9를 기준으로 설정
#             return {"message": "Images are too similar", "similarity": similarity}

#     return {"message": "Images are acceptable", "similarity": 0}