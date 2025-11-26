import { SkImage, Skia, useImage } from "@shopify/react-native-skia";
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Image } from "react-native";

type Mode = "view" | "editing" | "selectImage";
type Tool = "view" | "createPolygon" | "draw" | "delete";

interface DrawContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  tool: Tool;
  setTool: (tool: Tool) => void;
}

const drawContext = createContext<DrawContextType>({
  mode: "view",
  setMode: () => {},
  tool: "view",
  setTool: () => {},
});

export function DrawContextProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("selectImage");
  const [tool, setTool] = useState<Tool>("view");

  return (
    <drawContext.Provider
      value={{
        mode,
        setMode,
        tool,
        setTool,
      }}
    >
      {children}
    </drawContext.Provider>
  );
}

export const useDrawContext = () => useContext(drawContext);
