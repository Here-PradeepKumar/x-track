import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../components/TopBar';
import { Colors, kineticGradient } from '../theme/colors';

type ScanState = 'idle' | 'scanning' | 'success' | 'error';

const MOCK_ATHLETES: Record<string, { name: string; bib: string; wave: string; category: string }> = {
  '2481': { name: 'Pradeep Kumar', bib: '#2481', wave: 'ELITE 07:00', category: 'Open Male' },
  '1042': { name: 'Anjali Sharma', bib: '#1042', wave: 'COMP 08:30', category: 'Open Female' },
  '3369': { name: 'Rahul Mehta', bib: '#3369', wave: 'ELITE 07:00', category: 'Age 40-45' },
};

export function VolunteerScreen() {
  const insets = useSafeAreaInsets();
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [bibInput, setBibInput] = useState('');
  const [athlete, setAthlete] = useState<typeof MOCK_ATHLETES[string] | null>(null);
  const [showManual, setShowManual] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subtle idle pulse
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1200, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    );
    pulse.start();

    // Ring expand animation
    const ring = Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim, { toValue: 1, duration: 2000, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
        Animated.timing(ringAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    ring.start();

    return () => {
      pulse.stop();
      ring.stop();
    };
  }, []);

  const simulateScan = () => {
    setScanState('scanning');
    // Simulate NFC read delay
    setTimeout(() => {
      const keys = Object.keys(MOCK_ATHLETES);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      setAthlete(MOCK_ATHLETES[randomKey]);
      setScanState('success');
    }, 1500);
  };

  const handleManualSearch = () => {
    const found = MOCK_ATHLETES[bibInput.trim()];
    if (found) {
      setAthlete(found);
      setScanState('success');
      setShowManual(false);
    } else {
      setScanState('error');
      Alert.alert('Not Found', `BIB #${bibInput} not found in the system.`);
      setScanState('idle');
    }
  };

  const handleConfirm = () => {
    Alert.alert(
      'Registration Confirmed',
      `${athlete?.name} (${athlete?.bib}) has been successfully checked in.`,
      [
        {
          text: 'Done',
          onPress: () => {
            setScanState('idle');
            setAthlete(null);
            setBibInput('');
          },
        },
      ]
    );
  };

  const ringScale = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });
  const ringOpacity = ringAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.1, 0],
  });

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
      <TopBar rightBadge="VOLUNTEER MODE" />

      {/* Background radial accent */}
      <View style={styles.bgAccent}>
        <LinearGradient
          colors={[Colors.primaryContainer + '0D', 'transparent']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Instruction */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            TAP NFC BAND{'\n'}
            <Text style={{ color: Colors.primaryFixed }}>TO REGISTER BIB</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Hold wristband near the back of this device
          </Text>
        </View>

        {/* Scan Zone */}
        <TouchableOpacity
          style={styles.scanZone}
          onPress={simulateScan}
          activeOpacity={0.85}
          disabled={scanState === 'scanning'}
        >
          {/* Outer animated ring */}
          <Animated.View
            style={[
              styles.outerRing,
              { transform: [{ scale: ringScale }], opacity: ringOpacity },
            ]}
          />
          <View style={styles.middleRing} />

          {/* Center button */}
          <Animated.View style={[styles.scanCenter, { transform: [{ scale: pulseAnim }] }]}>
            <MaterialIcons
              name={
                scanState === 'scanning'
                  ? 'nfc'
                  : scanState === 'success'
                  ? 'check-circle'
                  : 'contactless'
              }
              size={72}
              color={Colors.primaryFixed}
              style={styles.scanIcon}
            />
          </Animated.View>

          {/* Status pill */}
          <View style={styles.statusPill}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    scanState === 'success'
                      ? Colors.primaryFixed
                      : scanState === 'scanning'
                      ? Colors.primaryDim
                      : Colors.primaryFixed,
                },
              ]}
            />
            <Text style={styles.statusText}>
              {scanState === 'scanning'
                ? 'READING...'
                : scanState === 'success'
                ? 'BAND DETECTED'
                : 'READY TO SCAN'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Data Fields */}
        <View style={styles.dataSection}>
          <View style={[styles.dataField, styles.dataFieldBib]}>
            <Text style={styles.fieldLabel}>BIB NUMBER</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldValue}>
                {athlete ? athlete.bib : '# -- -- --'}
              </Text>
              <MaterialIcons name="numbers" size={20} color={Colors.onSurfaceVariant} />
            </View>
          </View>

          <View style={[styles.dataField, styles.dataFieldName]}>
            <Text style={styles.fieldLabel}>PARTICIPANT NAME</Text>
            <View style={styles.fieldRow}>
              <Text style={[styles.fieldValue, !athlete && styles.fieldPlaceholder]}>
                {athlete ? athlete.name : 'Awaiting Scan...'}
              </Text>
              <MaterialIcons name="person" size={20} color={Colors.onSurfaceVariant} />
            </View>
          </View>

          {athlete && (
            <>
              <View style={styles.dataField}>
                <Text style={styles.fieldLabel}>WAVE</Text>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldValue}>{athlete.wave}</Text>
                  <MaterialIcons name="waves" size={20} color={Colors.onSurfaceVariant} />
                </View>
              </View>
              <View style={styles.dataField}>
                <Text style={styles.fieldLabel}>CATEGORY</Text>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldValue}>{athlete.category}</Text>
                  <MaterialIcons name="category" size={20} color={Colors.onSurfaceVariant} />
                </View>
              </View>
            </>
          )}
        </View>

        {/* Manual Entry */}
        {showManual && (
          <View style={styles.manualSection}>
            <Text style={styles.manualLabel}>ENTER BIB NUMBER</Text>
            <View style={styles.manualRow}>
              <TextInput
                style={styles.manualInput}
                value={bibInput}
                onChangeText={setBibInput}
                placeholder="e.g. 2481"
                placeholderTextColor={Colors.outlineVariant}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
              <TouchableOpacity
                style={styles.manualSearchBtn}
                onPress={handleManualSearch}
              >
                <MaterialIcons name="search" size={22} color={Colors.onPrimaryFixed} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Area */}
        <View style={styles.actionArea}>
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!athlete}
            style={{ opacity: athlete ? 1 : 0.4 }}
          >
            <LinearGradient colors={kineticGradient} style={styles.confirmBtn}>
              <Text style={styles.confirmBtnText}>Confirm Registration</Text>
              <MaterialIcons
                name="check-circle"
                size={22}
                color={Colors.onPrimaryContainer}
              />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manualEntryBtn}
            onPress={() => setShowManual(!showManual)}
          >
            <Text style={styles.manualEntryText}>Manual Search Entry</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Check-ins */}
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>RECENT CHECK-INS</Text>
          {[
            { bib: '#0847', name: 'Vikram Nair', time: '06:52' },
            { bib: '#1203', name: 'Sunita Rao', time: '06:50' },
            { bib: '#3301', name: 'Kiran Patel', time: '06:48' },
          ].map((entry, i) => (
            <View key={i} style={styles.recentRow}>
              <View style={styles.recentLeft}>
                <Text style={styles.recentBib}>{entry.bib}</Text>
                <Text style={styles.recentName}>{entry.name}</Text>
              </View>
              <View style={styles.recentRight}>
                <MaterialIcons name="check-circle" size={14} color={Colors.electricOrange} />
                <Text style={styles.recentTime}>{entry.time}</Text>
              </View>
            </View>
          ))}
        </View>

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
  bgAccent: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 24,
    paddingTop: 8,
    alignItems: 'center',
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    gap: 8,
  },
  heroTitle: {
    fontFamily: 'Inter_900Black',
    fontSize: 34,
    color: Colors.onSurface,
    textAlign: 'center',
    letterSpacing: -1.5,
    textTransform: 'uppercase',
    fontStyle: 'italic',
    lineHeight: 38,
  },
  heroSubtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Scan zone
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
  scanIcon: {
    opacity: 0.9,
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
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: Colors.onSurface,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Data fields
  dataSection: {
    width: '100%',
    gap: 10,
  },
  dataField: {
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 2,
  },
  dataFieldBib: {
    borderLeftWidth: 2,
    borderLeftColor: Colors.primaryContainer,
  },
  dataFieldName: {
    borderLeftWidth: 2,
    borderLeftColor: Colors.secondary,
  },
  fieldLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  fieldValue: {
    fontFamily: 'Inter_900Black',
    fontSize: 26,
    color: Colors.onSurface,
    letterSpacing: -1,
    fontStyle: 'italic',
  },
  fieldPlaceholder: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    fontStyle: 'italic',
    color: Colors.onSurfaceVariant,
  },

  // Manual entry
  manualSection: {
    width: '100%',
    gap: 8,
  },
  manualLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  manualRow: {
    flexDirection: 'row',
    gap: 8,
  },
  manualInput: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 2,
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  manualSearchBtn: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 20,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Action
  actionArea: {
    width: '100%',
    gap: 8,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 2,
    gap: 12,
  },
  confirmBtnText: {
    fontFamily: 'Inter_900Black',
    fontSize: 18,
    color: Colors.onPrimaryContainer,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  manualEntryBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  manualEntryText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  // Recent
  recentSection: {
    width: '100%',
    gap: 12,
  },
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
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recentBib: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
    color: Colors.electricOrange,
    letterSpacing: 1,
  },
  recentName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.onSurface,
  },
  recentRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recentTime: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
});
