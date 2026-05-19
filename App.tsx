import 'react-native-gesture-handler';
import React from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WineTastingProvider } from './src/context/WineTastingContext';
import AppNavigator from './src/navigation/AppNavigator';
import DevReporter from './src/components/DevReporter';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <WineTastingProvider>
        <View style={{ flex: 1 }}>
          <AppNavigator />
          <DevReporter />
        </View>
      </WineTastingProvider>
    </GestureHandlerRootView>
  );
}
