## routers 디렉토리

### routers/__init__.py

라우터 모듈을 패키지로 인식시키기 위한 파일입니다.

### routers/register.py

- **경로**: `/register`, `/register_user/`
- **기능**: 회원가입 페이지를 제공하고, 사용자 정보를 등록합니다.

### routers/similarity.py

- **경로**: `/check_similarity/`
- **기능**: 두 이미지 간의 유사도를 검사합니다.

### routers/angle.py

- **경로**: `/check_angle/`
- **기능**: 업로드된 얼굴 이미지의 각도를 검사하여 정면, 좌측, 우측을 확인합니다.

### routers/identify.py

- **경로**: `/identify_user/`
- **기능**: 업로드된 이미지를 기반으로 사용자 식별을 수행합니다.