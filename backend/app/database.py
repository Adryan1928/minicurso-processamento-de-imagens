from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
import os
from app.utils import load_env

load_env()

DATABASE_URL = os.getenv("DATABASE_URL")


db = create_engine(DATABASE_URL)

Base = declarative_base()