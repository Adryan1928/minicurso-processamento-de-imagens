import os
from fastapi import APIRouter, Form, UploadFile, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependecies import get_session
from app.models import ImageItem
from app.schemas import AreaDataFormat, ImageResponse
from fastapi.responses import FileResponse
import uuid
from app.code.fill_or_blur import draw_fill_or_blur_on_image
import cv2
import numpy as np
from typing import List
import json

router = APIRouter()

MEDIA_DIR = "app/media/"
os.makedirs(MEDIA_DIR, exist_ok=True)


@router.post("/images/", response_model=ImageResponse)
async def upload_image(
    image: UploadFile,
    areas: str = Form(...),
    session: Session = Depends(get_session)
):
    ext = image.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"

    file_path = f"{MEDIA_DIR}/{filename}"

    areas = [AreaDataFormat(**area) for area in json.loads(areas)]

    print(areas)

    contents = await image.read()
    np_img = cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)

    processed_image = draw_fill_or_blur_on_image(
        image=np_img,
        areas=areas,
    )

    with open(file_path, "wb") as f:
        f.write(processed_image.read())

    item = ImageItem(
        filename=filename,
    )

    session.add(item)
    session.commit()
    session.refresh(item)

    return ImageResponse(
        id=item.id,
        filename=item.filename,
        url=f"/images/{item.filename}"
    )


@router.get("/images/{image_id}")
def get_image(image_id: int, session: Session = Depends(get_session)):

    item = session.query(ImageItem).filter_by(id=image_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Image not found")

    file_path = f"{MEDIA_DIR}/{item.filename}"

    return ImageResponse(
        id=item.id,
        filename=item.filename,
        url=f"/media/{item.filename}"
    )


@router.get("/media/{filename}")
def serve_media(filename: str):
    file_path = os.path.join(MEDIA_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path)