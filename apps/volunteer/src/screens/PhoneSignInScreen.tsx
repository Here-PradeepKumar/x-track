import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import {
  PhoneAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { auth, firebaseConfig } from '@x-track/firebase';
import { Colors, kineticGradient } from '@x-track/ui';

type Step = 'phone' | 'otp';

export function PhoneSignInScreen() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);

  const sendOTP = async () => {
    const formatted = phone.startsWith('+') ? phone : `+91${phone}`;
    if (formatted.length < 10) {
      Alert.alert('Invalid number', 'Enter a valid phone number.');
      return;
    }
    setLoading(true);
    try {
      const provider = new PhoneAuthProvider(auth);
      const vid = await provider.verifyPhoneNumber(
        formatted,
        recaptchaVerifier.current!
      );
      setVerificationId(vid);
      setStep('otp');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Enter the 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await signInWithCredential(auth, credential);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Invalid code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <MaterialIcons name="leaderboard" size={32} color={Colors.electricOrange} />
        <Text style={styles.brand}>X-TRACK</Text>
        <View style={styles.volunteerChip}>
          <Text style={styles.volunteerChipText}>VOLUNTEER</Text>
        </View>
      </View>

      <View style={styles.card}>
        {step === 'phone' ? (
          <>
            <Text style={styles.title}>VOLUNTEER SIGN IN</Text>
            <Text style={styles.subtitle}>Enter your registered phone number.</Text>

            <View style={styles.inputRow}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="00000 00000"
                placeholderTextColor={Colors.outlineVariant}
                keyboardType="phone-pad"
                maxLength={10}
                autoFocus
              />
            </View>

            <TouchableOpacity onPress={sendOTP} disabled={loading}>
              <LinearGradient colors={kineticGradient} style={styles.btn}>
                {loading
                  ? <ActivityIndicator color={Colors.onPrimaryFixed} />
                  : <Text style={styles.btnText}>SEND CODE</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep('phone')}>
              <MaterialIcons name="arrow-back" size={20} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>

            <Text style={styles.title}>VERIFY CODE</Text>
            <Text style={styles.subtitle}>
              Code sent to {phone.startsWith('+') ? phone : `+91 ${phone}`}.
            </Text>

            <TextInput
              style={[styles.input, styles.otpInput]}
              value={otp}
              onChangeText={setOtp}
              placeholder="• • • • • •"
              placeholderTextColor={Colors.outlineVariant}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            <TouchableOpacity onPress={verifyOTP} disabled={loading}>
              <LinearGradient colors={kineticGradient} style={styles.btn}>
                {loading
                  ? <ActivityIndicator color={Colors.onPrimaryFixed} />
                  : <Text style={styles.btnText}>VERIFY & SIGN IN</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resendBtn} onPress={() => setStep('phone')}>
              <Text style={styles.resendText}>Resend Code</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        attemptInvisibleVerification
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: { alignItems: 'center', marginBottom: 40, gap: 6 },
  brand: {
    fontFamily: 'Inter_900Black',
    fontSize: 28,
    color: Colors.electricOrange,
    letterSpacing: -1,
    fontStyle: 'italic',
  },
  volunteerChip: {
    backgroundColor: Colors.electricOrange + '22',
    borderWidth: 1,
    borderColor: Colors.electricOrange,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 2,
  },
  volunteerChipText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: Colors.electricOrange,
    letterSpacing: 3,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: 28,
    borderRadius: 4,
    gap: 16,
  },
  title: {
    fontFamily: 'Inter_900Black',
    fontSize: 20,
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  inputRow: { flexDirection: 'row', gap: 8 },
  countryCode: {
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRadius: 2,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.onSurface,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 2,
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.onSurface,
    letterSpacing: 1,
  },
  otpInput: { textAlign: 'center', fontSize: 24, letterSpacing: 8 },
  btn: {
    paddingVertical: 18,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: 'Inter_900Black',
    fontSize: 14,
    color: Colors.onPrimaryFixed,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  backBtn: { alignSelf: 'flex-start', padding: 4, marginBottom: 4 },
  resendBtn: { alignItems: 'center', paddingVertical: 8 },
  resendText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: Colors.electricOrange,
    letterSpacing: 1,
  },
});
