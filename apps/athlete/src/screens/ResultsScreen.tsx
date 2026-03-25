import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../components/TopBar';
import { Colors, kineticGradient } from '../theme/colors';

export function ResultsScreen() {
  const insets = useSafeAreaInsets();

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'X-TRACK | Devil Circuit NCR | Total Time: 01:14:22 | Rank: 42nd | 18/20 Obstacles Cleared. #XTrack #PrecisionGrit',
        title: 'My Race Result - X-TRACK',
      });
    } catch {
      Alert.alert('Share', 'Unable to share at this time.');
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Sharing Card */}
        <View style={styles.shareCard}>
          {/* Background gradient */}
          <LinearGradient
            colors={[Colors.surfaceContainerHighest, Colors.surfaceContainerLow, Colors.background]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          {/* Diagonal accent */}
          <LinearGradient
            colors={[Colors.primaryContainer + '0D', Colors.transparent]}
            style={styles.diagonalAccent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          {/* Card Content */}
          <View style={styles.cardContent}>
            {/* Top: Event + QR */}
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.eventLabel}>EVENT NAME</Text>
                <Text style={styles.eventName}>Devil Circuit NCR</Text>
              </View>
              <View style={styles.qrBox}>
                <MaterialIcons name="qr-code-2" size={24} color={Colors.onSurface} />
              </View>
            </View>

            {/* Mid: Hero Time */}
            <View style={styles.cardMid}>
              <Text style={styles.totalTimeLabel}>Total Time</Text>
              <Text style={styles.totalTime}>01:14:22</Text>

              <View style={styles.metricsRow}>
                <View style={[styles.metricBox, styles.metricBoxPrimary]}>
                  <Text style={styles.metricBoxLabel}>OBSTACLES CLEARED</Text>
                  <Text style={styles.metricBoxValue}>18/20</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricBoxLabel}>FINAL RANK</Text>
                  <Text style={[styles.metricBoxValue, { color: Colors.secondary, fontStyle: 'italic' }]}>42nd</Text>
                </View>
              </View>
            </View>

            {/* Footer Stats */}
            <View style={styles.cardFooter}>
              <View style={styles.footerStats}>
                <View>
                  <Text style={styles.footerLabel}>PACE</Text>
                  <Text style={styles.footerValue}>6'12"/km</Text>
                </View>
                <View>
                  <Text style={styles.footerLabel}>HEART RATE</Text>
                  <Text style={styles.footerValue}>172 BPM</Text>
                </View>
              </View>
              <View>
                <Text style={styles.brandName}>X-TRACK</Text>
                <Text style={styles.brandTagline}>PRECISION GRIT</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity onPress={handleShare}>
          <LinearGradient colors={kineticGradient} style={styles.shareBtn}>
            <MaterialIcons name="share" size={20} color={Colors.onPrimaryFixed} />
            <Text style={styles.shareBtnText}>SHARE TO INSTAGRAM</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn}>
          <MaterialIcons name="download" size={20} color={Colors.onSurface} />
          <Text style={styles.saveBtnText}>SAVE TO GALLERY</Text>
        </TouchableOpacity>

        {/* Performance Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Performance Breakdown</Text>
          <Text style={styles.breakdownText}>
            Peak performance sustained during the first 5km. Vertical obstacle transitions were 12%
            faster than previous personal best.
          </Text>
          <View style={styles.prBadge}>
            <MaterialIcons name="military-tech" size={20} color={Colors.electricOrange} />
            <Text style={styles.prText}>Personal Record: Obstacle Split</Text>
          </View>
        </View>

        {/* Split Times */}
        <View style={styles.splitsCard}>
          <Text style={styles.splitsTitle}>SPLIT BREAKDOWN</Text>
          <View style={styles.splitsList}>
            {[
              { km: '0-5 KM', time: '22:14', pace: '4:26/km', delta: 'PR', accent: Colors.secondary },
              { km: '5-10 KM', time: '24:08', pace: '4:49/km', delta: '+2:34', accent: Colors.outlineVariant },
              { km: '10-15 KM', time: '28:00', pace: '5:36/km', delta: '+5:22', accent: Colors.primaryContainer },
            ].map((split, i) => (
              <View key={i} style={[styles.splitRow, { borderTopWidth: 2, borderTopColor: split.accent }]}>
                <Text style={styles.splitKm}>{split.km}</Text>
                <Text style={styles.splitTime}>{split.time}</Text>
                <Text style={styles.splitPace}>{split.pace}</Text>
                <View
                  style={[
                    styles.splitDelta,
                    split.delta === 'PR' && styles.splitDeltaPR,
                  ]}
                >
                  <Text
                    style={[
                      styles.splitDeltaText,
                      split.delta === 'PR' && styles.splitDeltaTextPR,
                    ]}
                  >
                    {split.delta}
                  </Text>
                </View>
              </View>
            ))}
          </View>
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
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    paddingTop: 8,
  },

  // Share Card
  shareCard: {
    borderRadius: 4,
    overflow: 'hidden',
    padding: 24,
    minHeight: 340,
    justifyContent: 'space-between',
  },
  diagonalAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: Colors.electricOrange,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  eventName: {
    fontFamily: 'Inter_900Black',
    fontSize: 24,
    color: Colors.onSurface,
    letterSpacing: -1,
    fontStyle: 'italic',
  },
  qrBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 8,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardMid: {
    gap: 16,
    paddingVertical: 24,
  },
  totalTimeLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  totalTime: {
    fontFamily: 'Inter_900Black',
    fontSize: 64,
    color: Colors.primaryContainer,
    letterSpacing: -3,
    lineHeight: 68,
    fontStyle: 'italic',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: 'rgba(31,31,33,0.4)',
    padding: 14,
    borderRadius: 2,
  },
  metricBoxPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryContainer,
  },
  metricBoxLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metricBoxValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: Colors.onSurface,
    letterSpacing: -1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
    marginTop: 8,
  },
  footerStats: {
    flexDirection: 'row',
    gap: 24,
  },
  footerLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footerValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  brandName: {
    fontFamily: 'Inter_900Black',
    fontSize: 18,
    color: Colors.electricOrange,
    fontStyle: 'italic',
    letterSpacing: -0.5,
    textAlign: 'right',
  },
  brandTagline: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 7,
    color: Colors.onSurfaceVariant,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'right',
  },

  // Action buttons
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 2,
    gap: 10,
    shadowColor: Colors.electricOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  shareBtnText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 12,
    color: Colors.onPrimaryFixed,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    gap: 10,
  },
  saveBtnText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 11,
    color: Colors.onSurface,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Breakdown
  breakdownCard: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: 20,
    borderRadius: 2,
    gap: 12,
  },
  breakdownTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  breakdownText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 2,
  },
  prText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: Colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },

  // Splits
  splitsCard: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: 20,
    borderRadius: 2,
    gap: 16,
  },
  splitsTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  splitsList: {
    gap: 12,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  splitKm: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 11,
    color: Colors.onSurface,
    letterSpacing: 1,
    width: 70,
  },
  splitTime: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: Colors.onSurface,
    letterSpacing: -0.5,
    flex: 1,
    textAlign: 'center',
  },
  splitPace: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    flex: 1,
    textAlign: 'center',
  },
  splitDelta: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 2,
    backgroundColor: Colors.surfaceContainerHighest,
  },
  splitDeltaPR: {
    backgroundColor: Colors.electricOrange + '1A',
  },
  splitDeltaText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  splitDeltaTextPR: {
    color: Colors.electricOrange,
  },
});
