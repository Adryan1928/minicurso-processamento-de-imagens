import { Image, useImage } from "@shopify/react-native-skia";
import { useDrawContext } from "@/contexts/drawContext";

interface ImageViewerProps {
  placeholderImageSource: string;
  imageWidth: number;
  imageHeight: number;
}

export default function ImageViewer({ placeholderImageSource, imageWidth, imageHeight }: ImageViewerProps) {
  const { skImage } = useDrawContext();

  const placeholder = useImage(placeholderImageSource);

  const imageToRender = skImage ?? placeholder;

  if (!imageToRender) return null;


  console.log("Rendering image with size:", imageToRender.width(), "x", imageToRender.height());

  return (
    <Image
      image={imageToRender}
      fit="contain"
      x={0}
      y={0}
      width={imageWidth}
      height={imageHeight}
    />
  );
}
