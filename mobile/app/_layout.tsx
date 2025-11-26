import { Slot } from 'expo-router';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { DrawContextProvider } from '@/contexts/drawContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/utils/QueryClient';

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <QueryClientProvider client={queryClient}>
          <DrawContextProvider>
            <Slot />
          </DrawContextProvider>
        </QueryClientProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
