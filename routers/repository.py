from fastapi import APIRouter, HTTPException, Form, Query
from db.database import add_attendance_entry, update_exit_time, update_return_time, update_leave_time, get_user_id, get_today_attendance, get_one_today_attendance

router = APIRouter()



# 최근 유저의 오늘 출결 요청 처리
@router.get("/get_one_today_attendance")
async def get_o_t_attendance(name: str = Query(...), date: str = Query(...)):
    a = get_one_today_attendance(name, date)
    print("a : ", a)
    return a;


# 오늘 출결 리스트 요청 처리
@router.get("/get_today_attendance")
async def get_t_attendance():
    return get_today_attendance();


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
