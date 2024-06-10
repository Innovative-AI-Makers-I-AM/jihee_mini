from fastapi import FastAPI, Form, HTTPException, Request, File, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os
import base64
import json
from typing import List
import numpy as np
import cv2
from insightface.app import FaceAnalysis

app = FastAPI()
app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

face_app = FaceAnalysis(providers=['CPUExecutionProvider'])
face_app.prepare(ctx_id=0, det_size=(640, 640))

def calculate_face_similarity(feat1, feat2) -> float:
    similarity = np.dot(feat1, feat2.T)
    return float(similarity)

@app.on_event("startup")
async def startup_event():
    # Ensure the 'data/users' directory exists
    os.makedirs('data/users', exist_ok=True)

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@app.post("/register_user/")
async def register_user(name: str = Form(...), image1: str = Form(...), image2: str = Form(...), image3: str = Form(...)):
    os.makedirs(f'data/users/{name}', exist_ok=True)
    images = [image1, image2, image3]
    embeddings = []

    for i, image in enumerate(images, start=1):
        image_data = base64.b64decode(image.split(",")[1])
        image_path = f'data/users/{name}/image{i}.png'
        with open(image_path, "wb") as f:
            f.write(image_data)
        
        img = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)
        faces = face_app.get(img)
        if not faces:
            raise HTTPException(status_code=400, detail="No face detected in one of the images")

        embeddings.append(faces[0].normed_embedding.tolist())

    user_data = {"name": name, "embeddings": embeddings}
    user_file = f"data/users/{name}.json"
    with open(user_file, 'w') as f:
        json.dump(user_data, f)

    return {"message": "User registered successfully."}

@app.post("/identify_user/")
async def identify_user(file: UploadFile = File(...)):
    image = await file.read()
    img = cv2.imdecode(np.frombuffer(image, np.uint8), cv2.IMREAD_COLOR)
    faces = face_app.get(img)

    if not faces:
        raise HTTPException(status_code=400, detail="No face detected")

    target_embedding = faces[0].normed_embedding
    users_dir = "data/users"
    max_similarity = 0
    identified_user = None

    for user_file in os.listdir(users_dir):
        if user_file.endswith(".json"):
            with open(os.path.join(users_dir, user_file), 'r') as f:
                user_data = json.load(f)

            for embedding in user_data["embeddings"]:
                similarity = calculate_face_similarity(np.array(embedding), target_embedding)
                if similarity > max_similarity:
                    max_similarity = similarity
                    identified_user = user_data

    if identified_user:
        return {"name": identified_user["name"], "similarity": max_similarity}

    raise HTTPException(status_code=404, detail="No matching user found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
