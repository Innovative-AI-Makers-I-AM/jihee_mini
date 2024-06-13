import numpy as np
from insightface.app import FaceAnalysis

# 얼굴 분석을 위한 FaceAnalysis 객체 생성 및 준비
face_app = FaceAnalysis(providers=['CPUExecutionProvider'])
face_app.prepare(ctx_id=0, det_size=(640, 640))

def calculate_face_similarity(feat1, feat2) -> float:
    """얼굴 임베딩 간 유사도를 계산하는 함수"""
    similarity = np.dot(feat1, feat2.T)
    print("float : ")
    print(similarity)  
    print("max : ") 
    print(float(np.max(similarity)))
    return float(np.max(similarity))

def check_image_angles(faces):
    '''얼굴 이미지에서 얼굴 각도를 체크하는 함수'''
    for face in faces:
        # 얼굴의 랜드마크 추출
        landmarks = face.landmark_2d_106

        # 왼쪽 눈, 오른쪽 눈, 코의 위치 추출
        left_eye = landmarks[38]
        right_eye = landmarks[88]
        nose = landmarks[54]

        # 눈 사이의 거리 계산
        eye_dx = right_eye[0] - left_eye[0]
        eye_dy = right_eye[1] - left_eye[1]
        
        # 코와 왼쪽 눈 사이의 거리 계싼
        nose_left_eye_dx = nose[0] - left_eye[0]
        nose_left_eye_dy = nose[1] - left_eye[1]
        
        # 코와 오른쪽 눈 사이의 거리 계산
        nose_right_eye_dx = nose[0] - right_eye[0]
        nose_right_eye_dy = nose[1] - right_eye[1]
        
        # 눈 사이의 각도 계산 (라디안을 도로 변환)
        eye_angle = np.arctan2(eye_dy, eye_dx) * 180 / np.pi

        # 코와 눈 사이의 각도 계산 (라디안을 도로 변환)
        nose_left_eye_angle = np.arctan2(nose_left_eye_dy, nose_left_eye_dx) * 180 / np.pi
        nose_right_eye_angle = np.arctan2(nose_right_eye_dy, nose_right_eye_dx) * 180 / np.pi

        # 평균 각도 계산
        avg_angle = (eye_angle + nose_left_eye_angle + nose_right_eye_angle) / 3

        # 각도를 기준으로 얼굴 방향 판단
        print(f"Eye Angle: {eye_angle}, Nose-Left Eye Angle: {nose_left_eye_angle}, Nose-Right Eye Angle: {nose_right_eye_angle}, Average Angle: {avg_angle}")  # 각도 값을 로그로 출력
        if 60 < avg_angle < 70:
            return 'front'  # 정면
        elif avg_angle <= 60:
            return 'left'   # 왼쪽
        elif avg_angle >= 70:
            return 'right'  # 오른쪽
    return 'unknown'
