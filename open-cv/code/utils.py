import cv2
from pathlib import Path
import numpy as np
import tempfile
from PIL import Image, ImageOps
from typing import List, Dict, Optional
from dataclasses import dataclass
import io
import urllib.request

def imload(image):
    """
    Load an image from ndarray, bytes, URL, or file path.
    Automatically handles EXIF orientation (for files and URLs)
    while preserving the original number of channels.
    Returns a NumPy array in OpenCV's channel order (BGR/BGRA/GRAY).
    """
    if isinstance(image, np.ndarray):
        return image

    elif isinstance(image, bytes):
        arr = np.frombuffer(image, dtype=np.uint8)
        return cv2.imdecode(arr, cv2.IMREAD_UNCHANGED)

    elif isinstance(image, str):
        if image.startswith(("http://", "https://")):
            with urllib.request.urlopen(image) as req:
                data = req.read()
            image_pil = Image.open(io.BytesIO(data))
        else:
            image_pil = Image.open(image)

        image_pil = ImageOps.exif_transpose(image_pil)

        mode = image_pil.mode
        img_np = np.array(image_pil)

        if mode == "RGB":
            img_np = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        elif mode == "RGBA":
            img_np = cv2.cvtColor(img_np, cv2.COLOR_RGBA2BGRA)
        elif mode == "CMYK":
            image_pil = image_pil.convert("RGB")
            img_np = cv2.cvtColor(np.array(image_pil), cv2.COLOR_RGB2BGR)
        elif mode == "P":
            if "transparency" in image_pil.info:
                image_pil = image_pil.convert("RGBA")
                img_np = cv2.cvtColor(np.array(image_pil), cv2.COLOR_RGBA2BGRA)
            else:
                image_pil = image_pil.convert("RGB")
                img_np = cv2.cvtColor(np.array(image_pil), cv2.COLOR_RGB2BGR)

        return img_np

    raise TypeError("Unsupported image input type. Expected ndarray, bytes, or str.")


def convert_array_to_image(array, quality=90, **kwargs):
    if array.shape[2] == 4:
        img = Image.fromarray(cv2.cvtColor(array, cv2.COLOR_BGRA2RGBA))
    else:
        img = Image.fromarray(cv2.cvtColor(array, cv2.COLOR_BGR2RGB))

    temp_file = tempfile.TemporaryFile(suffix='.png')
    img.save(temp_file, format='PNG', quality=quality, **kwargs)
    temp_file.seek(0)
    return temp_file


@dataclass
class AreaDataFormat:
    is_fill: bool
    area_coordinates: List[Dict[str, float]]
    intensity: Optional[int] = None