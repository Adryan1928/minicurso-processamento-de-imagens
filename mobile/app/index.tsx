import { StyleSheet, View, StatusBar, Image as ImgRN } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text } from "react-native-paper";
import { Canvas, Image, SkSize, Skia, Path, SkPath, SkImage } from "@shopify/react-native-skia";
import { useSharedValue, useDerivedValue, runOnJS } from "react-native-reanimated";
import { useDrawContext } from "@/contexts/drawContext";
import { Menu } from "@/components/menu";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import { useCallback, useEffect, useState } from "react";

const defaultImage = require("../assets/images/background-image.png");

export default function HomeScreen() {
  const { mode, setMode, tool } = useDrawContext();

  const [paths, setPaths] = useState<SkPath[]>([]);
  const [skImage, setSkImage] = useState<SkImage | null>(null);

  const canvasSize = useSharedValue<SkSize>({ width: 0, height: 0 });
  const imageWidth = useSharedValue(0);
  const imageHeight = useSharedValue(0);
  const imageXOffset = useSharedValue(0);
  const imageYOffset = useSharedValue(0);
  const canvasImageRatio = useSharedValue(1);

  const currentPath = useSharedValue<SkPath>(Skia.Path.Make());

  const savePath = useCallback(() => {
    const newPath = Skia.Path.Make();
    newPath.addPath(currentPath.value);
    setPaths((prevPaths) => [...prevPaths, newPath]);
    currentPath.value.reset();
  }, [setPaths, currentPath]);

  async function loadSkImage(source: any): Promise<SkImage | null> {
    try {
      const asset = ImgRN.resolveAssetSource(source);

      const response = await fetch(asset.uri);
      const buffer = await response.arrayBuffer();
      const skData = Skia.Data.fromBytes(new Uint8Array(buffer));
      return Skia.Image.MakeImageFromEncoded(skData) ?? null;
    } catch (e) {
      console.error("Erro ao carregar imagem:", e);
      return null;
    }
  }


  useEffect(() => {
    async function load() {
      const img = await loadSkImage(defaultImage);
      setSkImage(img);
    }
    load();
  }, []);
  

  useDerivedValue(() => {
    if (!skImage) return;

    const { width, height } = canvasSize.value;

    if (width === 0 || height === 0) return;

    const realWidth = skImage.width();
    const realHeight = skImage.height();

    if (width / height > realWidth / realHeight) {
      canvasImageRatio.value = realHeight / height;

      const scaledWidth = (realWidth * height) / realHeight;
      imageXOffset.value = (width - scaledWidth) / 2;
      imageYOffset.value = 0;

      imageWidth.value = scaledWidth;
      imageHeight.value = height;
    } else {
      canvasImageRatio.value = realWidth / width;

      const scaledHeight = (realHeight * width) / realWidth;
      imageYOffset.value = (height - scaledHeight) / 2;
      imageXOffset.value = 0;

      imageWidth.value = width;
      imageHeight.value = scaledHeight;
    }
  });


  const drawGesture = Gesture.Pan()
    .runOnJS(true)
    .minDistance(0)
    .hitSlop({ top: 0, bottom: 0, left: 0, right: 0 })
    .enabled(tool === "draw")
    .onBegin(({ x, y }) => {
      const xClamped = Math.max(
        imageXOffset.value,
        Math.min(x, imageXOffset.value + imageWidth.value)
      );

      const yClamped = Math.max(
        imageYOffset.value,
        Math.min(y, imageYOffset.value + imageHeight.value)
      );

      currentPath.value.reset();
      currentPath.value.moveTo(xClamped, yClamped);
    })
    .onChange(({ x, y, translationX, translationY }) => {
      const xClamped = Math.max(
        imageXOffset.value,
        Math.min(x, imageXOffset.value + imageWidth.value)
      );

      const yClamped = Math.max(
        imageYOffset.value,
        Math.min(y, imageYOffset.value + imageHeight.value)
      );

      currentPath.value.lineTo(xClamped, yClamped);
    })
    .onFinalize(() => {
      currentPath.value.close();
      runOnJS(savePath)();
    });

  if (!skImage) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#212121" }}>
        <Text style={{ color: "#fff", textAlign: "center", marginTop: 30 }}>
          Carregando imagem...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#212121" }}>
      <StatusBar barStyle={"light-content"} />

      <View style={styles.containerImage}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <GestureDetector gesture={drawGesture}>
            <Canvas style={{ flex: 1 }} onSize={canvasSize}>
              <Image
                image={skImage}
                x={imageXOffset}
                y={imageYOffset}
                width={imageWidth}
                height={imageHeight}
              />
              {paths.map((path, index) => (
                <Path
                  key={index}
                  path={path}
                  style="fill"
                  color="#000"
                />
              ))}
              <Path path={currentPath} style="stroke" strokeWidth={4} color="#37607050" />
            </Canvas>
          </GestureDetector>
        </GestureHandlerRootView>
      </View>

      <View style={{ zIndex: 10 }}>
        {mode === "selectImage" ? (
          <View style={{ alignItems: "center", padding: 16, gap: 8 }}>
            <Text style={{ color: "#fff" }}>Select an Image to Continue</Text>
            <Button onPress={() => setMode("view")} mode="outlined">
              Usar default
            </Button>
          </View>
        ) : (
          <View style={{ alignItems: "center" }}>
            <Menu />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerImage: {
    flex: 1,
  },
});
