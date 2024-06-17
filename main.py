from fastapi import  FastAPI, Request, Depends, Form, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os
from routers import register, similarity, angle, identify
# 가람추가
from sqlalchemy.orm import Session
from database.database import engine, get_db, Base
from database.models import User, Managing
from datetime import date, datetime, time
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

# 가람추가
@app.post("/api/record_time")
async def record_time(user_id: int, action: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    today = date.today()
    managing = db.query(Managing).filter(Managing.user_id == user_id, Managing.date == today).first()

    if not managing:
        managing = Managing(user_id=user_id, date=today)
        db.add(managing)
    
    current_time = datetime.now().time()

    if action == 'check_in':
        managing.check_in = current_time
    elif action == 'out_time':
        managing.out_time = current_time
    elif action == 'return_time':
        managing.return_time = current_time
    elif action == 'check_out':
        managing.check_out = current_time
    else : 
        raise HTTPException(status_code= 400, detail="Invalid action")
    
    db.commit()
    return {"success" : True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
