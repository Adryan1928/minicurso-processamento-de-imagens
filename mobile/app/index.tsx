import { StyleSheet, View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text } from "react-native-paper";
import { Canvas, Group, Image, useImage, SkSize, Skia, Path, SkPath } from "@shopify/react-native-skia";
import { useSharedValue, useDerivedValue, runOnJS } from "react-native-reanimated";
import { useDrawContext } from "@/contexts/drawContext";
import { Menu } from "@/components/menu";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import { useCallback, useState } from "react";

const defaultImage = require("../assets/images/background-image.png");

export default function HomeScreen() {
  const { mode, setMode, tool } = useDrawContext();

  const [dimensions, setDimensions] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [paths, setPaths] = useState<SkPath[]>([]);

  const canvasSize = useSharedValue<SkSize>({ width: 0, height: 0 });
  const imageWidth = useSharedValue(0);
  const imageHeight = useSharedValue(0);
  const imageXOffset = useSharedValue(0);
  const imageYOffset = useSharedValue(0);
  const canvasImageRatio = useSharedValue(1);

  const currentPath = useSharedValue<SkPath>(Skia.Path.Make());

  const skImage = useImage(defaultImage);


  const savePath = useCallback(() => {
    const newPath = Skia.Path.Make();
    newPath.addPath(currentPath.value);
    setPaths((prevPaths) => [...prevPaths, newPath]);
    currentPath.value.reset();
    // console.log(paths)
  }, [setPaths, currentPath]);
  

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

    runOnJS(() => setDimensions({
        x: imageXOffset.value,
        y: imageYOffset.value,
        width: imageWidth.value - imageXOffset.value * 2,
        height: imageHeight.value - imageYOffset.value * 2,
      }));
  });


  const drawGesture = Gesture.Pan()
    .runOnJS(true)
    .enabled(tool === "draw")
    .onBegin(({ x, y }) => {
      x = Math.max(0, Math.min(x, dimensions.width));
      y = Math.max(0, Math.min(y, dimensions.height));

      const xPos = x + imageXOffset.value;
      const yPos = y + imageYOffset.value;

      // path.value.reset();
      // path.value.moveTo(xPos, yPos);
      console.log("begin", x, y);
      currentPath.value.reset();
      currentPath.value.moveTo(xPos, yPos);
    })
    .onChange(({ x, y, translationX, translationY }) => {
      x = Math.max(0, Math.min(x, dimensions.width));
      y = Math.max(0, Math.min(y, dimensions.height));

      const xPos = x + imageXOffset.value;
      const yPos = y + imageYOffset.value;

      console.log(x, y, translationX, translationY);

      currentPath.value.lineTo(translationX, translationY);
    })
    .onFinalize(() => {
      currentPath.value.close();
      runOnJS(savePath)();
      console.log("finalize");
    });

  const path = Skia.Path.Make();
  path.moveTo(128, 0);
  path.lineTo(168, 80);
  path.lineTo(256, 93);
  path.lineTo(192, 155);
  path.lineTo(207, 244);
  path.lineTo(128, 202);
  path.lineTo(49, 244);
  path.lineTo(64, 155);
  path.lineTo(0, 93);
  path.lineTo(88, 80);
  path.lineTo(128, 0);
  path.close();

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
        <GestureHandlerRootView style={{ width: "100%", height: "100%" }}>
          <GestureDetector gesture={drawGesture}>
            <Canvas style={{ flex: 1 }} onSize={canvasSize}>
              <Group>
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
                    style="stroke"
                    color="#0037ff"
                    strokeWidth={4}
                  />
                ))}

                <Path path={path} style="stroke" strokeWidth={4} color="#37607050" />
              </Group>
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
