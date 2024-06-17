from fastapi import APIRouter, HTTPException, Form, Query
from db.database import add_attendance_entry, update_exit_time, update_return_time, update_leave_time, get_user_id

router = APIRouter()


# 유저 ID 요청 처리
@router.get("/get_user_id")
async def handle_get_user_id(name: str = Query(...)):
    user_id = get_user_id(name)
    if user_id is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": user_id}


# 입실 요청 처리
@router.post("/attendance")
async def handle_attendance(user_id: int = Form(...)):
    add_attendance_entry(user_id)

    return {"message": "처리가 완료되었습니다."}

# 외출 요청 처리
@router.post("/leave")
async def handle_leave(user_id: int = Form(...)):
    update_leave_time(user_id)

    return {"message": "처리가 완료되었습니다."}

# 복귀 요청 처리
@router.post("/return")
async def handle_return(user_id: int = Form(...)):
    update_return_time(user_id)

    return {"message": "처리가 완료되었습니다."}

# 퇴실 요청 처리
@router.post("/exit")
async def handle_exit(user_id: int = Form(...)):
    update_exit_time(user_id)

    return {"message": "처리가 완료되었습니다."}

# # FastAPI 애플리케이션 생성
# from fastapi import FastAPI

# app = FastAPI()
# app.include_router(router)
