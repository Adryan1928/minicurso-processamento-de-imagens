from pydantic import BaseModel

class ImageResponse(BaseModel):
    id: int
    filename: str
    is_fill: bool
    intensity: int
    url: str

    class Config:
        from_attributes = True
