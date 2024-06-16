from fastapi import  FastAPI, Request, Depends, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os
from routers import register, similarity, angle, identify
# 가람추가
from sqlalchemy.orm import Session
from database.database import engine, get_db, Base
from database.models import User, Managing
# 가람추가

app = FastAPI()

# 정적 파일 및 템플릿 설정
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# 라우터 등록
app.include_router(register.router)
app.include_router(similarity.router)
app.include_router(angle.router)
app.include_router(identify.router)

@app.on_event("startup")
async def startup_event():
    Base.metadata.create_all(bind=engine)
    os.makedirs('data/users', exist_ok=True)

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
