import unittest
import cv2
import numpy as np
import json
from typing import List

from code.fill_or_blur import draw_fill_or_blur_on_image
from code.utils import (
   AreaDataFormat,
)
with open('./tests/coordinates.jsonc', 'r') as f:
    """
    - List of de_identifications
    """
    coordinate_list:List[List[dict[str, float]]] = json.load(f)
        
class TestFillOrBlurDraw(unittest.TestCase):

    def setUp(self):
        self.test_image = cv2.imread('./images/background-image.png')

        self.coords_1 = coordinate_list[0]
        self.coords_2 = coordinate_list[1]

    def test_draw_fill_or_blur_on_image(self):
        areas = [
            AreaDataFormat(
                is_fill=True,
                area_coordinates=self.coords_1,
            ),
            AreaDataFormat(
                is_fill=False,
                area_coordinates=self.coords_2,
                intensity=1
            ),
        ]

        # Debug = False
        result_file = draw_fill_or_blur_on_image(self.test_image, areas, debug=True)

        result_img = cv2.imdecode(
            np.frombuffer(result_file.read(), np.uint8),
            cv2.IMREAD_UNCHANGED
        )
        result_file.close()    
        
if __name__ == '__main__':
    unittest.main()
