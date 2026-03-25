import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@x-track/firebase';
import { Colors, kineticGradient } from '@x-track/ui';
import { TopBar } from '../components/TopBar';
import { useAuth } from '../context/AuthContext';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, userDoc } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userDoc?.displayName ?? '');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName });
      await updateDoc(doc(db, 'users', user.uid), { displayName });
      setEditing(false);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const handlePickPhoto = async () => {
    if (!user) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    setUploadingPhoto(true);
    try {
      const uri = result.assets[0].uri;
      const response = await fetch(uri);
      const blob = await response.blob();
      const photoRef = storageRef(storage, `avatars/${user.uid}`);
      await uploadBytes(photoRef, blob);
      const url = await getDownloadURL(photoRef);

      await updateProfile(user, { photoURL: url });
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not upload photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut(auth) },
    ]);
  };

  const photoURL = user?.photoURL ?? userDoc?.photoURL;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickPhoto} disabled={uploadingPhoto}>
            <View style={styles.avatarWrap}>
              {photoURL ? (
                <Image source={{ uri: photoURL }} style={styles.avatarImage} />
              ) : (
                <MaterialIcons name="person" size={48} color={Colors.onSurfaceVariant} />
              )}
              <View style={styles.avatarEditBadge}>
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color={Colors.onPrimaryFixed} />
                ) : (
                  <MaterialIcons name="photo-camera" size={14} color={Colors.onPrimaryFixed} />
                )}
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.phoneLabel}>{user?.phoneNumber ?? '—'}</Text>
        </View>

        {/* Display Name */}
        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>DISPLAY NAME</Text>
          {editing ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.nameInput}
                value={displayName}
                onChangeText={setDisplayName}
                autoFocus
                placeholder="Your name"
                placeholderTextColor={Colors.outlineVariant}
              />
              <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn}>
                {saving ? (
                  <ActivityIndicator size="small" color={Colors.onPrimaryFixed} />
                ) : (
                  <MaterialIcons name="check" size={20} color={Colors.onPrimaryFixed} />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.nameRow} onPress={() => setEditing(true)}>
              <Text style={styles.nameValue}>{displayName || 'Tap to set name'}</Text>
              <MaterialIcons name="edit" size={18} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>RACES</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxMid]}>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>BEST RANK</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>PR TIME</Text>
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <MaterialIcons name="logout" size={18} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App version */}
        <Text style={styles.version}>X-TRACK v1.0.0</Text>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
    paddingTop: 8,
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  avatarWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surfaceContainerHighest,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  fieldCard: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLow,
    padding: 20,
    borderRadius: 2,
    gap: 8,
  },
  fieldLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  editRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  nameInput: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.onSurface,
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 2,
  },
  saveBtn: {
    width: 44,
    height: 44,
    backgroundColor: Colors.primaryFixed,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 2,
    overflow: 'hidden',
  },
  statBox: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  statBoxMid: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  statValue: {
    fontFamily: 'Inter_900Black',
    fontSize: 22,
    color: Colors.onSurface,
    letterSpacing: -1,
  },
  statLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 8,
    color: Colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  signOutBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.errorContainer,
    marginTop: 8,
  },
  signOutText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 12,
    color: Colors.error,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  version: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 10,
    color: Colors.outlineVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 8,
  },
});
