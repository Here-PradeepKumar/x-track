import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { db, BibDoc, CheckpointDoc } from '@x-track/firebase';
import { Colors, kineticGradient } from '@x-track/ui';
import { useAuth } from '../context/AuthContext';

type ScanState = 'idle' | 'scanning' | 'found' | 'confirming' | 'success' | 'error';

interface ScannedAthlete {
  bibNumber: string;
  athleteUid: string;
  wave: string;
  category: string;
  nfcTagId: string;
}

interface RecentCheckIn {
  bibNumber: string;
  scannedAt: any;
}

export function NFCScanScreen() {
  const insets = useSafeAreaInsets();
  const { user, userDoc } = useAuth();
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scannedAthlete, setScannedAthlete] = useState<ScannedAthlete | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([]);
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);
  const [milestoneName, setMilestoneName] = useState('');
  const [eventName, setEventName] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  const eventId = userDoc?.assignedEventId ?? '';
  const milestoneId = userDoc?.assignedMilestoneId ?? '';

  // ── Animations ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1200, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    );
    const ring = Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim, { toValue: 1, duration: 2000, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
        Animated.timing(ringAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    pulse.start();
    ring.start();
    return () => { pulse.stop(); ring.stop(); };
  }, []);

  // ── NFC init ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    NfcManager.isSupported().then((supported) => {
      setNfcSupported(supported);
      if (supported) NfcManager.start();
    });
    return () => { NfcManager.cancelTechnologyRequest().catch(() => {}); };
  }, []);

  // ── Fetch assigned event/milestone metadata ──────────────────────────────────

  useEffect(() => {
    if (!eventId) return;

    getDoc(doc(db, 'events', eventId)).then((snap) => {
      if (snap.exists()) setEventName(snap.data().name ?? '');
    });

    if (milestoneId) {
      getDoc(doc(db, `events/${eventId}/milestones`, milestoneId)).then((snap) => {
        if (snap.exists()) setMilestoneName(snap.data().name ?? '');
      });
    }
  }, [eventId, milestoneId]);

  // ── Recent check-ins listener ────────────────────────────────────────────────

  useEffect(() => {
    if (!eventId || !user) return;

    const q = query(
      collection(db, 'checkpoints'),
      where('eventId', '==', eventId),
      where('volunteerUid', '==', user.uid),
      orderBy('scannedAt', 'desc'),
      limit(5)
    );

    const unsub = onSnapshot(q, (snap) => {
      setRecentCheckIns(
        snap.docs.map((d) => ({
          bibNumber: d.data().bibNumber,
          scannedAt: d.data().scannedAt,
        }))
      );
    });

    return unsub;
  }, [eventId, milestoneId, user]);

  // ── NFC scan ─────────────────────────────────────────────────────────────────

  const startNFCScan = async () => {
    setScanState('scanning');
    try {
      await NfcManager.requestTechnology(NfcTech.NfcA);
      const tag = await NfcManager.getTag();
      const tagId = tag?.id ?? '';

      if (!tagId) throw new Error('Could not read NFC tag ID.');

      await lookupBib(tagId);
    } catch (e: any) {
      if (e.message !== 'cancelled') {
        setScanState('error');
        Alert.alert('Scan Failed', e.message ?? 'Could not read NFC tag.');
        setTimeout(() => setScanState('idle'), 2000);
      } else {
        setScanState('idle');
      }
    } finally {
      NfcManager.cancelTechnologyRequest().catch(() => {});
    }
  };

  // ── Simulation (DEV only) ────────────────────────────────────────────────────

  const simulateScan = async () => {
    setScanState('scanning');
    // Pick a random bib from the event
    const bibsSnap = await getDocs(
      query(collection(db, `events/${eventId}/bibs`), limit(10))
    );
    if (bibsSnap.empty) {
      Alert.alert('No BIBs', 'No bibs registered for this event yet.');
      setScanState('idle');
      return;
    }
    const docs = bibsSnap.docs;
    const randomBib = docs[Math.floor(Math.random() * docs.length)].data() as BibDoc;
    await lookupBib(randomBib.nfcTagId);
  };

  // ── Bib lookup ───────────────────────────────────────────────────────────────

  const lookupBib = async (tagId: string) => {
    if (!eventId) {
      Alert.alert('Not assigned', 'You have not been assigned to an event yet.');
      setScanState('idle');
      return;
    }

    const bibsQ = query(
      collection(db, `events/${eventId}/bibs`),
      where('nfcTagId', '==', tagId)
    );
    const snap = await getDocs(bibsQ);

    if (snap.empty) {
      setScanState('error');
      Alert.alert('Unknown Band', 'This wristband is not registered for this event.');
      setTimeout(() => setScanState('idle'), 2000);
      return;
    }

    const bibData = snap.docs[0].data() as BibDoc;
    setScannedAthlete({
      bibNumber: bibData.bibNumber,
      athleteUid: bibData.athleteUid,
      wave: bibData.wave,
      category: bibData.category,
      nfcTagId: tagId,
    });
    setScanState('found');
  };

  // ── Confirm checkpoint ────────────────────────────────────────────────────────

  const confirmCheckpoint = async () => {
    if (!scannedAthlete || !user || !eventId) return;
    setScanState('confirming');

    try {
      await addDoc(collection(db, 'checkpoints'), {
        eventId,
        milestoneId: milestoneId || null,
        bibNumber: scannedAthlete.bibNumber,
        athleteUid: scannedAthlete.athleteUid,
        volunteerUid: user.uid,
        nfcTagId: scannedAthlete.nfcTagId,
        scannedAt: serverTimestamp(),
      } satisfies Omit<CheckpointDoc, 'id'>);

      setScanState('success');
      setTimeout(() => {
        setScanState('idle');
        setScannedAthlete(null);
      }, 2500);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not record checkpoint.');
      setScanState('found');
    }
  };

  const ringScale = ringAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });
  const ringOpacity = ringAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 0.1, 0] });

  const isAssigned = !!eventId;

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

        {/* Assignment info */}
        {isAssigned ? (
          <View style={styles.assignmentCard}>
            <Text style={styles.assignmentLabel}>YOUR ASSIGNMENT</Text>
            <Text style={styles.assignmentEvent}>{eventName || eventId}</Text>
            {milestoneId ? (
              <View style={styles.milestonePill}>
                <MaterialIcons name="place" size={14} color={Colors.electricOrange} />
                <Text style={styles.milestonePillText}>{milestoneName || milestoneId}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.awaitingCard}>
            <MaterialIcons name="hourglass-empty" size={32} color={Colors.onSurfaceVariant} />
            <Text style={styles.awaitingTitle}>AWAITING ASSIGNMENT</Text>
            <Text style={styles.awaitingSubtitle}>
              You have not been added to any active event roster yet.
              Ask your organizer to import your phone number.
            </Text>
          </View>
        )}

        {/* Hero instruction */}
        {isAssigned && (
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              TAP NFC BAND{'\n'}
              <Text style={{ color: Colors.primaryFixed }}>TO CHECK IN</Text>
            </Text>
            <Text style={styles.heroSubtitle}>Hold wristband near the back of this device</Text>
          </View>
        )}

        {/* Scan zone */}
        {isAssigned && (
          <TouchableOpacity
            style={styles.scanZone}
            onPress={nfcSupported ? startNFCScan : simulateScan}
            activeOpacity={0.85}
            disabled={scanState === 'scanning' || scanState === 'confirming'}
          >
            <Animated.View
              style={[styles.outerRing, { transform: [{ scale: ringScale }], opacity: ringOpacity }]}
            />
            <View style={styles.middleRing} />

            <Animated.View style={[styles.scanCenter, { transform: [{ scale: pulseAnim }] }]}>
              <MaterialIcons
                name={
                  scanState === 'success' ? 'check-circle'
                  : scanState === 'error' ? 'error'
                  : 'contactless'
                }
                size={72}
                color={
                  scanState === 'success' ? Colors.primaryFixed
                  : scanState === 'error' ? Colors.error
                  : Colors.primaryFixed
                }
              />
            </Animated.View>

            <View style={styles.statusPill}>
              <View style={[styles.statusDot, {
                backgroundColor:
                  scanState === 'success' ? Colors.primaryFixed
                  : scanState === 'error' ? Colors.error
                  : Colors.primaryFixed,
              }]} />
              <Text style={styles.statusText}>
                {scanState === 'scanning' ? 'READING...'
                : scanState === 'found' ? 'BAND DETECTED'
                : scanState === 'confirming' ? 'SAVING...'
                : scanState === 'success' ? 'CHECKED IN ✓'
                : scanState === 'error' ? 'NOT FOUND'
                : nfcSupported === false ? 'SIMULATE SCAN'
                : 'READY TO SCAN'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Athlete confirmation card (shown after scan) */}
        {(scanState === 'found' || scanState === 'confirming') && scannedAthlete && (
          <View style={styles.athleteCard}>
            <Text style={styles.athleteCardLabel}>SCANNED ATHLETE</Text>
            <View style={styles.athleteRow}>
              <View>
                <Text style={styles.bibNumber}>{scannedAthlete.bibNumber}</Text>
                <Text style={styles.athleteWave}>{scannedAthlete.wave} · {scannedAthlete.category}</Text>
              </View>
              <TouchableOpacity
                onPress={confirmCheckpoint}
                disabled={scanState === 'confirming'}
                style={{ opacity: scanState === 'confirming' ? 0.6 : 1 }}
              >
                <LinearGradient colors={kineticGradient} style={styles.confirmBtn}>
                  <MaterialIcons name="check-circle" size={22} color={Colors.onPrimaryContainer} />
                  <Text style={styles.confirmBtnText}>CONFIRM</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* DEV simulate button */}
        {isAssigned && __DEV__ && nfcSupported !== true && (
          <TouchableOpacity style={styles.simulateBtn} onPress={simulateScan}>
            <Text style={styles.simulateBtnText}>[ DEV ] Simulate NFC Scan</Text>
          </TouchableOpacity>
        )}

        {/* Recent check-ins */}
        {recentCheckIns.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>RECENT CHECK-INS</Text>
            {recentCheckIns.map((entry, i) => (
              <View key={i} style={styles.recentRow}>
                <View style={styles.recentLeft}>
                  <MaterialIcons name="check-circle" size={14} color={Colors.electricOrange} />
                  <Text style={styles.recentBib}>#{entry.bibNumber}</Text>
                </View>
                <Text style={styles.recentTime}>
                  {entry.scannedAt?.toDate
                    ? entry.scannedAt.toDate().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </Text>
              </View>
            ))}
          </View>
        )}

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
    gap: 24,
    paddingTop: 8,
    alignItems: 'center',
  },
  assignmentCard: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLow,
    padding: 16,
    borderRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: Colors.electricOrange,
    gap: 4,
  },
  assignmentLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  assignmentEvent: {
    fontFamily: 'Inter_900Black',
    fontSize: 18,
    color: Colors.onSurface,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  milestonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  milestonePillText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 11,
    color: Colors.electricOrange,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  awaitingCard: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLow,
    padding: 32,
    borderRadius: 2,
    alignItems: 'center',
    gap: 12,
  },
  awaitingTitle: {
    fontFamily: 'Inter_900Black',
    fontSize: 16,
    color: Colors.onSurface,
    letterSpacing: -0.3,
    textTransform: 'uppercase',
  },
  awaitingSubtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
  },
  heroSection: { alignItems: 'center', gap: 8 },
  heroTitle: {
    fontFamily: 'Inter_900Black',
    fontSize: 30,
    color: Colors.onSurface,
    textAlign: 'center',
    letterSpacing: -1.5,
    textTransform: 'uppercase',
    fontStyle: 'italic',
    lineHeight: 34,
  },
  heroSubtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scanZone: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: Colors.primaryFixed,
  },
  middleRing: {
    position: 'absolute',
    width: 196,
    height: 196,
    borderRadius: 98,
    borderWidth: 1,
    borderColor: Colors.primaryFixed + '1A',
  },
  scanCenter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.electricOrange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 12,
  },
  statusPill: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 2,
    gap: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: Colors.onSurface,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  athleteCard: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLow,
    padding: 20,
    borderRadius: 2,
    gap: 12,
    borderTopWidth: 2,
    borderTopColor: Colors.secondary,
  },
  athleteCardLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 9,
    color: Colors.secondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  athleteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bibNumber: {
    fontFamily: 'Inter_900Black',
    fontSize: 32,
    color: Colors.onSurface,
    letterSpacing: -1,
    fontStyle: 'italic',
  },
  athleteWave: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 2,
    gap: 8,
  },
  confirmBtnText: {
    fontFamily: 'Inter_900Black',
    fontSize: 14,
    color: Colors.onPrimaryContainer,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  simulateBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 2,
    borderStyle: 'dashed',
  },
  simulateBtnText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  recentSection: { width: '100%', gap: 10 },
  recentTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 2,
  },
  recentLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  recentBib: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    color: Colors.electricOrange,
    letterSpacing: 1,
  },
  recentTime: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
});
