from fastapi import APIRouter, Form, HTTPException
import base64
import cv2
import numpy as np
from utils.face import face_app, check_image_angles #, calculate_face_similarity

router = APIRouter()

@router.post("/check_angle/")
async def check_angle(image: str = Form(...), step: int = Form(...)):
    '''각도 검사 엔드포인트'''
    image_data = base64.b64decode(image.split(",")[1])
    img = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)
    faces = face_app.get(img)

    if not faces:
        raise HTTPException(status_code=400, detail="No face detected")

    angle = check_image_angles(faces)
    if step == 1 and angle != 'front':
        raise HTTPException(status_code=400, detail="Please take a front photo.")
    elif step == 2 and angle != 'left':
        raise HTTPException(status_code=400, detail="Please take a left side photo.")
    elif step == 3 and angle != 'right':
        raise HTTPException(status_code=400, detail="Please take a right side photo.")

    return {"message": "Angle is correct"}

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