from sqlalchemy import Column, Integer, Boolean, String
from app.database import Base

class ImageItem(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    is_fill = Column(Boolean, default=False)
    intensity = Column(Integer, default=3)
