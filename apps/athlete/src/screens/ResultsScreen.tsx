import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { TopBar } from '../components/TopBar';
import { Colors, kineticGradient } from '../theme/colors';
import { useCompletedRaces } from '../hooks/useActiveRace';
import { AthleteRaceDoc } from '@x-track/firebase';

function formatMs(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function buildPerformanceBreakdown(race: AthleteRaceDoc, isPR: boolean): string {
  const cleared = race.checkpoints.length;
  const total = race.totalMilestones;
  const pct = total > 0 ? Math.round((cleared / total) * 100) : 0;

  if (cleared === 0) return 'No checkpoints recorded for this race.';

  // Find fastest and slowest split
  let fastestMs = Infinity;
  let slowestMs = 0;
  let fastestName = '';
  let slowestName = '';
  const baseMs = race.startedAt?.toMillis() ?? 0;

  race.checkpoints.forEach((cp, i) => {
    const prevMs = i === 0 ? baseMs : (race.checkpoints[i - 1].scannedAt?.toMillis() ?? baseMs);
    const thisMs = cp.scannedAt?.toMillis() ?? 0;
    const split = thisMs - prevMs;
    if (split > 0 && split < fastestMs) { fastestMs = split; fastestName = cp.milestoneName; }
    if (split > slowestMs) { slowestMs = split; slowestName = cp.milestoneName; }
  });

  const lines: string[] = [];
  lines.push(`Completed ${cleared} of ${total} milestones (${pct}%).`);
  if (fastestName) lines.push(`Fastest split: ${fastestName} (${formatMs(fastestMs)}).`);
  if (slowestName && slowestName !== fastestName) lines.push(`Slowest split: ${slowestName} (${formatMs(slowestMs)}).`);
  if (isPR) lines.push('This is your new personal best time.');
  return lines.join(' ');
}

// ── Race Card ─────────────────────────────────────────────────────────────────

interface RaceCardProps {
  race: AthleteRaceDoc;
  isPR: boolean;
}

function RaceCard({ race, isPR }: RaceCardProps) {
  const viewShotRef = useRef<ViewShot>(null);
  const [saving, setSaving] = useState(false);

  const totalTime = race.totalTimeMs != null ? formatMs(race.totalTimeMs) : '—:—:—';
  const cleared = race.checkpoints.length;
  const total = race.totalMilestones;
  const finishDate = race.finishedAt?.toDate().toLocaleDateString('en-IN') ?? '—';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `X-TRACK | ${race.eventName} | BIB #${race.bibNumber} | Total Time: ${totalTime} | ${cleared}/${total} Milestones Cleared. #XTrack #PrecisionGrit`,
        title: 'My Race Result - X-TRACK',
      });
    } catch {
      Alert.alert('Share', 'Unable to share at this time.');
    }
  };

  const handleSaveToGallery = async () => {
    setSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save photos to your gallery.');
        return;
      }
      const uri = await (viewShotRef.current as any).capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Saved!', 'Race result saved to your gallery.');
    } catch {
      Alert.alert('Error', 'Could not save to gallery.');
    } finally {
      setSaving(false);
    }
  };

  const breakdown = buildPerformanceBreakdown(race, isPR);

  return (
    <View>
      {/* Capturable result card */}
      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
        <View style={styles.shareCard}>
          <LinearGradient
            colors={[Colors.surfaceContainerHighest, Colors.surfaceContainerLow, Colors.background]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <LinearGradient
            colors={[Colors.primaryContainer + '0D', Colors.transparent]}
            style={styles.diagonalAccent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          <View style={styles.cardContent}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventLabel}>EVENT NAME</Text>
                <Text style={styles.eventName}>{race.eventName}</Text>
              </View>
              <View style={styles.qrBox}>
                <MaterialIcons name="qr-code-2" size={24} color={Colors.onSurface} />
              </View>
            </View>

            <View style={styles.cardMid}>
              <Text style={styles.totalTimeLabel}>TOTAL TIME</Text>
              <Text style={styles.totalTime}>{totalTime}</Text>

              <View style={styles.metricsRow}>
                <View style={[styles.metricBox, styles.metricBoxPrimary]}>
                  <Text style={styles.metricBoxLabel}>MILESTONES CLEARED</Text>
                  <Text style={styles.metricBoxValue}>{cleared}/{total}</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricBoxLabel}>BIB NUMBER</Text>
                  <Text style={[styles.metricBoxValue, { color: Colors.secondary, fontStyle: 'italic' }]}>
                    #{race.bibNumber}
                  </Text>
                </View>
              </View>

              {isPR && (
                <View style={styles.prBadge}>
                  <MaterialIcons name="emoji-events" size={14} color={Colors.electricOrange} />
                  <Text style={styles.prBadgeText}>PERSONAL RECORD</Text>
                </View>
              )}
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.footerStats}>
                <View>
                  <Text style={styles.footerLabel}>DATE</Text>
                  <Text style={styles.footerValue}>{finishDate}</Text>
                </View>
              </View>
              <View>
                <Text style={styles.brandName}>X-TRACK</Text>
                <Text style={styles.brandTagline}>PRECISION GRIT</Text>
              </View>
            </View>
          </View>
        </View>
      </ViewShot>

      {/* Action buttons */}
      <TouchableOpacity onPress={handleShare} style={{ marginTop: 12 }}>
        <LinearGradient colors={kineticGradient} style={styles.shareBtn}>
          <MaterialIcons name="share" size={20} color={Colors.onPrimaryFixed} />
          <Text style={styles.shareBtnText}>SHARE TO INSTAGRAM</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSaveToGallery} disabled={saving} style={styles.saveBtn}>
        {saving ? (
          <ActivityIndicator size="small" color={Colors.onSurface} />
        ) : (
          <MaterialIcons name="save-alt" size={18} color={Colors.onSurface} />
        )}
        <Text style={styles.saveBtnText}>SAVE TO GALLERY</Text>
      </TouchableOpacity>

      {/* Performance Breakdown */}
      <View style={styles.breakdownCard}>
        <Text style={styles.breakdownTitle}>PERFORMANCE BREAKDOWN</Text>
        <Text style={styles.breakdownText}>{breakdown}</Text>
      </View>

      {/* Split times */}
      {race.checkpoints.length > 0 && (
        <View style={styles.splitsCard}>
          <Text style={styles.splitsTitle}>SPLIT BREAKDOWN</Text>
          <View style={styles.splitsList}>
            {race.checkpoints.map((cp, i) => {
              const baseMs = race.startedAt?.toMillis() ?? 0;
              const prevMs = i === 0 ? baseMs : (race.checkpoints[i - 1].scannedAt?.toMillis() ?? baseMs);
              const thisMs = cp.scannedAt?.toMillis() ?? 0;
              const splitMs = thisMs - prevMs;
              return (
                <View key={cp.milestoneId} style={styles.splitRow}>
                  <Text style={styles.splitKm}>{cp.distanceMark}</Text>
                  <Text style={styles.splitName}>{cp.milestoneName}</Text>
                  <Text style={styles.splitTime}>{splitMs > 0 ? formatMs(splitMs) : '—'}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const { races, loading } = useCompletedRaces();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Determine PR: the race with the lowest totalTimeMs
  const prTimeMs = races.reduce<number | null>((best, r) => {
    if (r.totalTimeMs == null) return best;
    return best == null ? r.totalTimeMs : Math.min(best, r.totalTimeMs);
  }, null);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading results…</Text>
          </View>
        ) : races.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="emoji-events" size={48} color={Colors.outlineVariant} />
            <Text style={styles.emptyTitle}>NO RESULTS YET</Text>
            <Text style={styles.emptySubtitle}>Complete a race to see your results here.</Text>
          </View>
        ) : (
          <>
            {races.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.raceSelector}>
                {races.map((r, i) => (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() => setSelectedIndex(i)}
                    style={[styles.raceSelectorChip, i === selectedIndex && styles.raceSelectorChipActive]}
                  >
                    <Text style={[styles.raceSelectorText, i === selectedIndex && styles.raceSelectorTextActive]}>
                      {r.eventName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <RaceCard
              race={races[selectedIndex]}
              isPR={races[selectedIndex]?.totalTimeMs != null && races[selectedIndex].totalTimeMs === prTimeMs}
            />
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 16, gap: 12, paddingTop: 8 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 16, paddingHorizontal: 24 },
  emptyTitle: { fontFamily: 'Inter_900Black', fontSize: 18, color: Colors.onSurface, letterSpacing: -0.5, textTransform: 'uppercase' },
  emptySubtitle: { fontFamily: 'Lexend_400Regular', fontSize: 13, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },
  emptyText: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: Colors.onSurfaceVariant },

  raceSelector: { marginBottom: 4 },
  raceSelectorChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 2, borderWidth: 1, borderColor: Colors.outlineVariant, marginRight: 8 },
  raceSelectorChipActive: { borderColor: Colors.electricOrange, backgroundColor: Colors.electricOrange + '1A' },
  raceSelectorText: { fontFamily: 'Lexend_700Bold', fontSize: 10, color: Colors.onSurfaceVariant, letterSpacing: 1, textTransform: 'uppercase' },
  raceSelectorTextActive: { color: Colors.electricOrange },

  shareCard: { borderRadius: 4, overflow: 'hidden', padding: 24, minHeight: 340, justifyContent: 'space-between' },
  diagonalAccent: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  cardContent: { flex: 1, justifyContent: 'space-between' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eventLabel: { fontFamily: 'Lexend_700Bold', fontSize: 9, color: Colors.electricOrange, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 2 },
  eventName: { fontFamily: 'Inter_900Black', fontSize: 22, color: Colors.onSurface, letterSpacing: -1, fontStyle: 'italic' },
  qrBox: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardMid: { gap: 16, paddingVertical: 24 },
  totalTimeLabel: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, letterSpacing: 2, textTransform: 'uppercase' },
  totalTime: { fontFamily: 'Inter_900Black', fontSize: 60, color: Colors.primaryContainer, letterSpacing: -3, lineHeight: 64, fontStyle: 'italic' },
  metricsRow: { flexDirection: 'row', gap: 12 },
  metricBox: { flex: 1, backgroundColor: 'rgba(31,31,33,0.4)', padding: 14, borderRadius: 2 },
  metricBoxPrimary: { borderLeftWidth: 4, borderLeftColor: Colors.primaryContainer },
  metricBoxLabel: { fontFamily: 'Lexend_400Regular', fontSize: 9, color: Colors.onSurfaceVariant, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  metricBoxValue: { fontFamily: 'Inter_700Bold', fontSize: 28, color: Colors.onSurface, letterSpacing: -1 },
  prBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.electricOrange + '60', backgroundColor: Colors.electricOrange + '12', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 2, alignSelf: 'flex-start' },
  prBadgeText: { fontFamily: 'Lexend_700Bold', fontSize: 9, color: Colors.electricOrange, letterSpacing: 2, textTransform: 'uppercase' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 16, marginTop: 8 },
  footerStats: { flexDirection: 'row', gap: 24 },
  footerLabel: { fontFamily: 'Lexend_400Regular', fontSize: 9, color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1 },
  footerValue: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Colors.onSurface, letterSpacing: -0.3 },
  brandName: { fontFamily: 'Inter_900Black', fontSize: 18, color: Colors.electricOrange, fontStyle: 'italic', letterSpacing: -0.5, textAlign: 'right' },
  brandTagline: { fontFamily: 'Lexend_400Regular', fontSize: 7, color: Colors.onSurfaceVariant, letterSpacing: 3, textTransform: 'uppercase', textAlign: 'right' },

  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 2, gap: 10 },
  shareBtnText: { fontFamily: 'Lexend_700Bold', fontSize: 12, color: Colors.onPrimaryFixed, letterSpacing: 2, textTransform: 'uppercase' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 2, borderWidth: 1, borderColor: Colors.outlineVariant, marginTop: 8 },
  saveBtnText: { fontFamily: 'Lexend_700Bold', fontSize: 12, color: Colors.onSurface, letterSpacing: 2, textTransform: 'uppercase' },

  breakdownCard: { backgroundColor: Colors.surfaceContainerLow, padding: 20, borderRadius: 2, gap: 10 },
  breakdownTitle: { fontFamily: 'Lexend_700Bold', fontSize: 10, color: Colors.onSurfaceVariant, letterSpacing: 3, textTransform: 'uppercase' },
  breakdownText: { fontFamily: 'Lexend_400Regular', fontSize: 13, color: Colors.onSurface, lineHeight: 20 },

  splitsCard: { backgroundColor: Colors.surfaceContainerLow, padding: 20, borderRadius: 2, gap: 16 },
  splitsTitle: { fontFamily: 'Lexend_700Bold', fontSize: 10, color: Colors.onSurfaceVariant, letterSpacing: 3, textTransform: 'uppercase' },
  splitsList: { gap: 0 },
  splitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.surfaceContainerHigh },
  splitKm: { fontFamily: 'Lexend_700Bold', fontSize: 10, color: Colors.onSurfaceVariant, letterSpacing: 1, width: 60 },
  splitName: { fontFamily: 'Inter_700Bold', fontSize: 13, color: Colors.onSurface, flex: 1, letterSpacing: -0.3, textTransform: 'uppercase' },
  splitTime: { fontFamily: 'Inter_700Bold', fontSize: 14, color: Colors.onSurface, letterSpacing: -0.5 },
});
