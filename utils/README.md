## utils 디렉토리

### utils/__init__.py

유틸리티 모듈을 패키지로 인식시키기 위한 파일입니다.

### utils/face.py

- **기능**: 얼굴 분석을 위한 모듈입니다.
  - `face_app`: FaceAnalysis 객체를 초기화하고 준비합니다.
  - `calculate_face_similarity(feat1, feat2)`: 두 얼굴 임베딩 간의 유사도를 계산합니다.
  - `check_image_angles(faces)`: 얼굴 이미지에서 얼굴 각도를 체크합니다.

### utils/file.py

- **기능**: 파일 관련 유틸리티 모듈입니다.
  - `save_user_images(name, images)`: 사용자 이미지를 저장하고 임베딩을 생성합니다