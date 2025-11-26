import ImageViewer from '@/components/ImageViewer';
import { StyleSheet, View, StatusBar,Image } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useDrawContext } from '@/contexts/drawContext';
import { Menu } from '@/components/menu';
import { runOnJS, useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { Canvas, Group, SkSize } from '@shopify/react-native-skia';

const defaultImage = require('@/assets/images/background-image.png');

export default function HomeScreen() {
  const { mode, setMode, skImage, setImage } = useDrawContext();

  const canvasSize = useSharedValue<SkSize>({ width: 0, height: 0 });
  const imageWidth = useSharedValue(0);
  const imageHeight = useSharedValue(0);
  const imageXOffset = useSharedValue(0);
  const imageYOffset = useSharedValue(0);
  const canvasImageRatio = useSharedValue(1);

  const defaultImageUri = Image.resolveAssetSource(defaultImage).uri;

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      await setImage(result.assets[0].uri);
      setMode('view');
    } else {
      alert("Você não selecionou nenhuma imagem.");
    }
  };


  useDerivedValue(() => {
    if (skImage) {
      console.log("Calculating image display parameters for image size:", skImage.width(), "x", skImage.height());
      const { width, height } = canvasSize.value;
      imageWidth.value = width;
      imageHeight.value = height;

      const { width: imageRealWidth, height: imageRealHeight } =
        skImage.getImageInfo();

      if (width / height > imageRealWidth / imageRealHeight) {
        canvasImageRatio.value = imageRealHeight / height;

        const imageScaledInCanvasWidth =
          (imageRealWidth * height) / imageRealHeight;
        imageXOffset.value = (width - imageScaledInCanvasWidth) / 2;
        imageYOffset.value = 0;
      } else {
        canvasImageRatio.value = imageRealWidth / width;

        const imageScaledInCanvasHeight =
          (imageRealHeight * width) / imageRealWidth;
        imageYOffset.value = (height - imageScaledInCanvasHeight) / 2;
        imageXOffset.value = 0;
      }
    }
  }, [skImage]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#212121' }}>
        <StatusBar barStyle={'light-content'}/>
        <View
          style={styles.containerImage}
        >
          <Canvas style={{ flex: 1 }}>
            <Group>
              <ImageViewer
                placeholderImageSource={defaultImage}
                imageWidth={imageWidth.value}
                imageHeight={imageHeight.value}
              />
            </Group>
          </Canvas>
        </View>
        <View style={{
          zIndex: 10,
        }}>
            {mode === 'selectImage' ? (
              <View style={{ alignItems: 'center', justifyContent: 'center', padding: 16, gap: 8 }}>
                <Text style={{ color: '#fff', marginBottom: 16 }}>Select an Image to Continue</Text>
                <View
                    style={{ flexDirection: 'row', gap: 8 }}
                >
                    <Button
                        onPress={pickImageAsync}
                        mode='contained'
                    >
                        Escolha uma imagem
                    </Button>
                    <Button
                        onPress={() => {
                            setImage(defaultImageUri);
                            setMode('view');
                        }}
                        mode='outlined'
                    >
                        Usar default
                    </Button>
                </View>
              </View>
            ): (
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Menu />
                </View>
            )}
        </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    minHeight: '100%',
  },
  containerImage: {
    flex: 1,
  }
});
