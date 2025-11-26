import { useDrawContext } from "@/contexts/drawContext";
import { StyleSheet, View } from "react-native";
import { IconButton } from "react-native-paper";

interface MenuProps {
  onSave: () => void;
}

export function Menu({ onSave }: MenuProps) {
  const { tool, setTool } = useDrawContext();

  return (
    <View style={styles.container}>
      <MenuItem
        icon="eye"
        onPress={() => {
          setTool('view');
        }}
        selected={tool === 'view'}
      />
      <MenuItem
        icon="draw"
        onPress={() => {
          setTool('draw');
        }}
        selected={tool === 'draw'}
      />
      <MenuItem
        icon="shape-polygon-plus"
        onPress={() => {
          setTool('createPolygon');
        }}
        selected={tool === 'createPolygon'}
      />
      <MenuItem
        icon="delete"
        onPress={() => {
          setTool('delete');
        }}
        selected={tool === 'delete'}
      />
      <MenuItem
        icon="content-save"
        onPress={() => {
          onSave();
          setTool('view');
        }}
      /> 
    </View>
  )
}

interface MenuItemProps {
    icon: string;
    onPress: () => void;
    selected?: boolean;
}
export function MenuItem({ icon, onPress, selected }: MenuItemProps) {
  return (
    <IconButton
      icon={icon}
      onPress={onPress}
      style={[styles.MenuItem, selected && { backgroundColor: '#c5c5c5' }]}
    />
  );
}


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
        gap: 16,
    },
    MenuItem: {
        borderRadius: 8,
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#efefef',
    }
})