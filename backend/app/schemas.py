from typing import Dict, List
from pydantic import BaseModel
class AreaDataFormat(BaseModel):
    area_coordinates: List[Dict[str, float]]
    is_fill: bool
    intensity: int | None

class ImageResponse(BaseModel):
    id: int
    filename: str
    url: str

    class Config:
        from_attributes = True
