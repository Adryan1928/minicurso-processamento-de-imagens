import { StyleSheet, View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text } from "react-native-paper";
import { Canvas, Group, Image, useImage, SkSize } from "@shopify/react-native-skia";
import { useSharedValue, useDerivedValue } from "react-native-reanimated";
import { useDrawContext } from "@/contexts/drawContext";
import { Menu } from "@/components/menu";

const defaultImage = require("../assets/images/background-image.png");

export default function HomeScreen() {
  const { mode, setMode } = useDrawContext();

  const canvasSize = useSharedValue<SkSize>({ width: 0, height: 0 });
  const imageWidth = useSharedValue(0);
  const imageHeight = useSharedValue(0);
  const imageXOffset = useSharedValue(0);
  const imageYOffset = useSharedValue(0);
  const canvasImageRatio = useSharedValue(1);

  const skImage = useImage(defaultImage);
  

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
        <Canvas style={{ flex: 1 }} onSize={canvasSize}>
          <Group>
            <Image
              image={skImage}
              x={imageXOffset}
              y={imageYOffset}
              width={imageWidth}
              height={imageHeight}
            />
          </Group>
        </Canvas>
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
