import { initializeAuth, getAuth } from 'firebase/auth';
import type { Persistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseApp } from './config';

// getReactNativePersistence lives in firebase/auth's 'react-native' export condition.
// Metro resolves it correctly at runtime; tsc (moduleResolution:node) does not see it,
// so we pull it via require() with an explicit type instead of a bare ESM import.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getReactNativePersistence } = require('firebase/auth') as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
};

// Use initializeAuth with React Native persistence so PhoneAuthProvider
// and other auth methods are fully available in the React Native environment.
// Guard against double-initialisation (hot reload, monorepo module splitting).
function createAuth() {
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(firebaseApp);
  }
}

export const auth = createAuth();
