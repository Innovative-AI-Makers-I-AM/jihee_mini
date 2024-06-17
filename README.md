# 환경 구성 명령어
```
conda create -n mini python=3.10 

conda activate mini

pip install -r requirements.txt 

pip install "uvicorn[standard]" 

uvicorn main:app --reload
```
# FastAPI Application

이 프로젝트는 FastAPI를 사용하여 구축된 얼굴 인식 및 유사도 검사 애플리케이션입니다. 프로젝트는 여러 파일로 나뉘어 있어 코드 관리가 용이하고 협업에 유리합니다.

# 디렉토리 구조
```bash
my_fastapi_app/

├── main.py

├── routers/

│   ├── init.py

│   ├── register.py

│   ├── similarity.py

│   ├── angle.py

│   ├── identify.py

├── utils/

│   ├── init.py

│   ├── face.py

│   ├── file.py

├── models/

│   ├── init.py

├── templates/

│   ├── index.html

│   ├── register.html

└── static/
```
