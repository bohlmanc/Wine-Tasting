import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WineTastingProvider } from './src/context/WineTastingContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <WineTastingProvider>
        <AppNavigator />
      </WineTastingProvider>
    </GestureHandlerRootView>
  );
}
