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
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { VolunteerNavigator } from './src/navigation/VolunteerNavigator';
import { PhoneSignInScreen } from './src/screens/PhoneSignInScreen';
import { AcceptInviteScreen } from './src/screens/AcceptInviteScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { Colors } from '@x-track/ui';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { user, userDoc, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={Colors.electricOrange} />
      </View>
    );
  }

  if (!user) {
    return <PhoneSignInScreen />;
  }

  if (!userDoc?.assignedEventId) {
    return <AcceptInviteScreen />;
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: Colors.primaryFixed,
          background: Colors.background,
          card: Colors.surfaceContainerLow,
          text: Colors.onSurface,
          border: Colors.outlineVariant,
          notification: Colors.primaryFixed,
        },
      }}
    >
      <VolunteerNavigator />
    </NavigationContainer>
  );
}

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

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <View style={styles.root} onLayout={onLayoutRootView}>
        <StatusBar style="light" backgroundColor={Colors.background} />
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  loadingScreen: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
