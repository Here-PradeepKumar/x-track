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
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '@x-track/firebase';
import { VolunteerNavigator } from './src/navigation/VolunteerNavigator';
import { PhoneSignInScreen } from './src/screens/PhoneSignInScreen';
import { AcceptInviteScreen } from './src/screens/AcceptInviteScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { Colors } from '@x-track/ui';

function NotRegisteredScreen() {
  return (
    <View style={styles.gateScreen}>
      <MaterialIcons name="block" size={56} color={Colors.error} />
      <Text style={styles.gateTitle}>Not Registered</Text>
      <Text style={styles.gateBody}>
        Your phone number is not on any active event roster.{'\n'}
        Ask your organiser to add you before signing in.
      </Text>
      <TouchableOpacity style={styles.gateSignOut} onPress={() => signOut(auth)}>
        <Text style={styles.gateSignOutText}>SIGN OUT</Text>
      </TouchableOpacity>
    </View>
  );
}

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { user, userDoc, loading, notRegistered } = useAuth();

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

  if (notRegistered) {
    return <NotRegisteredScreen />;
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
  gateScreen: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  gateTitle: {
    fontFamily: 'Inter_900Black',
    fontSize: 24,
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  gateBody: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  gateSignOut: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.errorContainer,
  },
  gateSignOutText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 11,
    color: Colors.error,
    letterSpacing: 2,
  },
});
