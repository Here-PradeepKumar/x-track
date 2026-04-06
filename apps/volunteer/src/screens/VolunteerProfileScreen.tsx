import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@x-track/firebase';
import { Colors } from '@x-track/ui';
import { useAuth } from '../context/AuthContext';

export function VolunteerProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, userDoc, registeredEvents } = useAuth();

  const eventId = userDoc?.assignedEventId;
  const milestoneId = userDoc?.assignedMilestoneId;

  const [resolvedEventName, setResolvedEventName] = useState<string | null>(null);
  const [resolvedMilestoneName, setResolvedMilestoneName] = useState<string | null>(null);

  // Resolve event name — from registeredEvents first, fall back to direct Firestore read
  useEffect(() => {
    const fromContext = registeredEvents.find(e => e.eventId === eventId)?.eventName;
    if (fromContext) {
      setResolvedEventName(fromContext);
      return;
    }
    if (!eventId) return;
    getDoc(doc(db, 'events', eventId))
      .then(snap => { if (snap.exists()) setResolvedEventName(snap.data().name ?? null); })
      .catch(() => {});
  }, [eventId, registeredEvents]);

  // Resolve milestone name from Firestore
  useEffect(() => {
    if (!eventId || !milestoneId) { setResolvedMilestoneName(null); return; }
    getDoc(doc(db, `events/${eventId}/milestones`, milestoneId))
      .then(snap => { if (snap.exists()) setResolvedMilestoneName(snap.data().name ?? null); })
      .catch(() => {});
  }, [eventId, milestoneId]);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut(auth) },
    ]);
  };

  const handleSwitchEvent = (eid: string) => {
    if (!user) return;
    void updateDoc(doc(db, 'users', user.uid), { assignedEventId: eid, assignedMilestoneId: null });
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <View style={styles.brand}>
          <MaterialIcons name="leaderboard" size={22} color={Colors.electricOrange} />
          <Text style={styles.brandText}>X-TRACK</Text>
        </View>
        <View style={styles.volunteerBadge}>
          <Text style={styles.volunteerBadgeText}>VOLUNTEER MODE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Avatar placeholder */}
        <View style={styles.avatarWrap}>
          <MaterialIcons name="person" size={48} color={Colors.onSurfaceVariant} />
        </View>

        {/* Phone */}
        <Text style={styles.phone}>{user?.phoneNumber ?? '—'}</Text>
        <Text style={styles.roleLabel}>VOLUNTEER</Text>

        {/* Assignment card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>ASSIGNMENT</Text>

          <View style={styles.infoRow}>
            <MaterialIcons name="event" size={18} color={Colors.onSurfaceVariant} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>EVENT</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {resolvedEventName ?? (eventId ? '—' : 'Not assigned')}
              </Text>
            </View>
            {registeredEvents.length > 1 && (
              <MaterialIcons name="expand-more" size={18} color={Colors.onSurfaceVariant} />
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialIcons name="place" size={18} color={Colors.electricOrange} />
            <View>
              <Text style={styles.infoLabel}>STATION</Text>
              <Text style={[styles.infoValue, { color: Colors.electricOrange }]}>
                {resolvedMilestoneName ?? (milestoneId ? '—' : 'Not assigned')}
              </Text>
            </View>
          </View>

          {!eventId && (
            <Text style={styles.awaitingNote}>
              Your organiser will assign you to a checkpoint. Once assigned, your milestone is permanent.
            </Text>
          )}
        </View>

        {/* Identification */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>IDENTIFICATION</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="fingerprint" size={18} color={Colors.onSurfaceVariant} />
            <View>
              <Text style={styles.infoLabel}>VOLUNTEER ID</Text>
              <Text style={styles.infoValue}>{user?.uid?.slice(0, 16) ?? '—'}</Text>
            </View>
          </View>
        </View>

        {/* Event switcher — only shown when registered for multiple events */}
        {registeredEvents.length > 1 && (
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>SWITCH EVENT</Text>
            {registeredEvents.map((event) => (
              <TouchableOpacity
                key={event.eventId}
                style={[
                  styles.eventRow,
                  event.eventId === eventId && styles.eventRowActive,
                ]}
                onPress={() => handleSwitchEvent(event.eventId)}
              >
                <Text style={[
                  styles.eventRowText,
                  event.eventId === eventId && styles.eventRowTextActive,
                ]}>
                  {event.eventName}
                </Text>
                {event.eventId === eventId && (
                  <MaterialIcons name="check-circle" size={16} color={Colors.primaryFixed} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <MaterialIcons name="logout" size={18} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 12,
    backgroundColor: Colors.background,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: {
    fontFamily: 'Inter_900Black',
    fontSize: 20,
    color: Colors.electricOrange,
    letterSpacing: -1,
    fontStyle: 'italic',
  },
  volunteerBadge: {
    borderWidth: 1,
    borderColor: Colors.electricOrange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  volunteerBadgeText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: Colors.electricOrange,
    letterSpacing: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
    paddingTop: 16,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surfaceContainerHighest,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phone: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  roleLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: Colors.electricOrange,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  infoCard: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLow,
    padding: 20,
    borderRadius: 2,
    gap: 12,
  },
  cardTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.onSurface,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.outlineVariant,
  },
  awaitingNote: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    lineHeight: 17,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  eventRowActive: {
    borderColor: Colors.primaryFixed,
    backgroundColor: 'rgba(202,253,0,0.06)',
  },
  eventRowText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  eventRowTextActive: {
    color: Colors.primaryFixed,
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
});
