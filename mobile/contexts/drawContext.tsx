import { SkImage, Skia, useImage } from "@shopify/react-native-skia";
import { createContext, useContext, useState, useCallback } from "react";
import { Platform } from "react-native";

type Mode = "view" | "editing" | "selectImage";
type Tool = "view" | "createPolygon" | "draw" | "delete";

interface DrawContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  selectedImageUri: string | null;
  skImage: SkImage | null;
  setImage: (uri: string | null) => Promise<void>;
  tool: Tool;
  setTool: (tool: Tool) => void;
}

const drawContext = createContext<DrawContextType>({
  mode: "view",
  setMode: () => {},
  selectedImageUri: null,
  skImage: null,
  setImage: async () => {},
  tool: "view",
  setTool: () => {},
});

export function DrawContextProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("selectImage");
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [skImage, setSkImage] = useState<SkImage | null>(null);
  const [tool, setTool] = useState<Tool>("view");

  const setImage = useCallback(async (uri: string | null) => {
    setSelectedImageUri(uri);

    if (!uri) {
      setSkImage(null);
      return;
    }

    try {
      // const data = await Skia.Data.fromURI(uri);
      // const img = Skia.Image.MakeImageFromEncoded(data);

      const img = useImage(uri);

      setSkImage(img);
      setMode("view");
    } catch (err) {
      console.warn("Erro ao carregar imagem Skia:", err);
      setSkImage(null);
    }
  }, []);

  return (
    <drawContext.Provider
      value={{
        mode,
        setMode,
        selectedImageUri,
        skImage,
        setImage,
        tool,
        setTool,
      }}
    >
      {children}
    </drawContext.Provider>
  );
}

export const useDrawContext = () => useContext(drawContext);
