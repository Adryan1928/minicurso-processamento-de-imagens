from fastapi import FastAPI
from app.routers import images

app = FastAPI()

app.include_router(images.router)
