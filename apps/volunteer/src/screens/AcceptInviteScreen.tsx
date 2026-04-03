import React, { useState } from 'react';
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
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@x-track/firebase';
import { Colors, kineticGradient } from '@x-track/ui';

export function AcceptInviteScreen() {
  const [inviteCode, setInviteCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const activate = async () => {
    const code = inviteCode.trim();
    if (!code) {
      Alert.alert('Missing code', 'Paste the invite code from your organizer.');
      return;
    }
    setLoading(true);
    try {
      const fn = httpsCallable(getFunctions(firebaseApp), 'acceptVolunteerInvite');
      await fn({ inviteId: code, displayName: displayName.trim() || undefined });
      // AuthContext onSnapshot will pick up the assignedEventId update automatically
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not activate invite. Check the code and try again.');
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
        <View style={styles.chip}>
          <Text style={styles.chipText}>VOLUNTEER</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>ENTER INVITE CODE</Text>
        <Text style={styles.subtitle}>
          Paste the invite code sent by your event organizer.
        </Text>

        <TextInput
          style={styles.input}
          value={inviteCode}
          onChangeText={setInviteCode}
          placeholder="Invite code"
          placeholderTextColor={Colors.outlineVariant}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
        />

        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your name (optional)"
          placeholderTextColor={Colors.outlineVariant}
          autoCapitalize="words"
        />

        <TouchableOpacity onPress={activate} disabled={loading}>
          <LinearGradient colors={kineticGradient} style={styles.btn}>
            {loading
              ? <ActivityIndicator color={Colors.onPrimaryFixed} />
              : <Text style={styles.btnText}>ACTIVATE</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  chip: {
    backgroundColor: Colors.electricOrange + '22',
    borderWidth: 1,
    borderColor: Colors.electricOrange,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 2,
  },
  chipText: {
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
  input: {
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 2,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.onSurface,
  },
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
  },
});
