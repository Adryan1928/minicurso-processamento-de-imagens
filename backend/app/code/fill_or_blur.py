import cv2
import numpy as np
from typing import List

from .utils import (
    imload,
    convert_array_to_image,
    AreaDataFormat,
)

def draw_fill_or_blur_on_image(
    image: np.ndarray,
    areas: List[AreaDataFormat],
    debug: bool = False
):
    """
    Applies de-identification effects (solid fill or blur) to specified polygonal
    regions of an anatomical image and returns the processed result.

    Each de-identification region can either:
      - Be filled with a solid black polygon (when `is_fill=True`)
      - Be blurred with variable intensity inside the polygon (when `is_fill=False`)

    Parameters
    ----------
    image : ndarray
        Input image as a NumPy array (BGR or BGRA).
    areas : list of AreaDataFormat
        List of areas data to render. Each entry contains:
        - area_coordinates : list of dict
            Polygon points, each with 'x' and 'y' (floats).
        - is_fill : bool
            If True, fills the polygon with solid black.
            If False, applies a Gaussian blur inside the polygon.
        - intensity : int or None
            Blur intensity level (1-5 recommended). The value is scaled
            to determine the sigma used in GaussianBlur.
            If None, a default intensity is applied.
    debug : bool, optional
        If True, displays the rendered image in a resizable OpenCV window
        for inspection.

    Returns
    -------
    tempfile._TemporaryFileWrapper
        A temporary PNG file object containing the rendered image.
        The file pointer is positioned at the beginning for immediate reading.
    """
    
    image = imload(image)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)
    scaleOfBlur = 3 * 2.8
    
    for area in areas:
        points = [(int(coord['x']), int(coord['y'])) for coord in area.area_coordinates]
        points_array = np.array(points, dtype=np.int32).reshape((-1, 1, 2))

        if area.is_fill:
            cv2.fillPoly(image, pts=[points_array], color=(0, 0, 0))
        else:
            mask = np.zeros(image.shape[:2], dtype=np.uint8)
            cv2.fillPoly(mask, [points_array], 255)

            intensity = area.intensity * scaleOfBlur   if area.intensity is not None else scaleOfBlur * 3

            blurred = cv2.GaussianBlur(image, (151, 151), sigmaX=intensity, sigmaY=intensity)

            image = np.where(mask[..., None] == 255, blurred, image)

    
    image = np.clip(image[..., :3], 0, 255).astype(np.uint8)
    
    if debug:
        scale = 3
        height, width = image.shape[:2]
        resize_value = (width * scale, height * scale)
        resized = cv2.resize(image, resize_value, interpolation= cv2.INTER_LINEAR)
        cv2.imshow("Image", resized)

        cv2.waitKey(0)
        cv2.destroyAllWindows()

    result = convert_array_to_image(image) 
    return result
