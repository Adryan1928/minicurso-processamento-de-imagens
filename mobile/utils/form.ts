import { Media } from "@/services/images";
import { SkImage, SkPath } from "@shopify/react-native-skia";

export function toFormData(data: Record<string, any>) {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]);
  });
  return formData;
}

export async function skImageToMedia(skImage: SkImage): Promise<Media> {
  const base64 = skImage.encodeToBase64();

  const blob = await fetch(`data:image/png;base64,${base64}`).then(res =>
    res.blob()
  );

  return {
    uri: `data:image/png;base64,${base64}`,
    name: "image.png",
    type: "image/png",
  };
}

export type Point = {
  x: number;
  y: number;
};

export function pathToPoints(path: SkPath) {
  "worklet";

  path.simplify();
  const pointsLength = path.countPoints();
  const points: Point[] = [];
  for (let i = 0; i < pointsLength; i++) {
    const point = path.getPoint(i);
    points.push({ x: point.x, y: point.y });
  }
  return points;
}
