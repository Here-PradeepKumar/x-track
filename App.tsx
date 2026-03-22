import React, { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import {
  Lexend_400Regular,
  Lexend_700Bold,
} from '@expo-google-fonts/lexend';
import * as SplashScreen from 'expo-splash-screen';
import { View, StyleSheet } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Colors } from './src/theme/colors';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_900Black,
    Lexend_400Regular,
    Lexend_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.root} onLayout={onLayoutRootView}>
        <StatusBar style="light" backgroundColor={Colors.background} />
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: Colors.primary,
              background: Colors.background,
              card: Colors.surfaceContainerLow,
              text: Colors.onSurface,
              border: Colors.outlineVariant,
              notification: Colors.primary,
            },
          }}
        >
          <AppNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
