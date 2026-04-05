import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseApp } from './config';

// Use initializeAuth with React Native persistence so that PhoneAuthProvider
// and other auth methods are fully available in the React Native environment.
// getAuth() uses browser-only persistence which makes verifyPhoneNumber undefined.
export const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});
