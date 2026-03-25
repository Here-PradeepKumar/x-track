import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../components/TopBar';
import { Colors, kineticGradient } from '../theme/colors';
import { useActiveRace } from '../hooks/useActiveRace';
import { CheckpointEntry } from '@x-track/firebase';

// ── Elapsed time ticker ───────────────────────────────────────────────────────

function useElapsedTime(startedAtMs: number | null): string {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (startedAtMs === null) return;
    const tick = () => setElapsed(Date.now() - startedAtMs);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAtMs]);

  const h = Math.floor(elapsed / 3600000);
  const m = Math.floor((elapsed % 3600000) / 60000);
  const s = Math.floor((elapsed % 60000) / 1000);
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ── Obstacle item ─────────────────────────────────────────────────────────────

interface ObstacleProps {
  checkpoint: CheckpointEntry;
  isCurrent: boolean;
  isLast: boolean;
}

function ObstacleItem({ checkpoint, isCurrent, isLast }: ObstacleProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isCurrent) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isCurrent]);

  const splitTime = checkpoint.scannedAt
    ? checkpoint.scannedAt.toDate().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '';

  return (
    <View style={styles.obstacleRow}>
      {!isLast && (
        <View style={[styles.timelineLine, { backgroundColor: Colors.primaryFixed }]} />
      )}

      <View style={styles.dotContainer}>
        {isCurrent ? (
          <Animated.View style={[styles.dot, styles.dotActive, { opacity: pulseAnim }]}>
            <View style={[styles.dotInner, { backgroundColor: Colors.primaryFixed }]} />
          </Animated.View>
        ) : (
          <View style={[styles.dot, { backgroundColor: Colors.primaryFixed, alignItems: 'center', justifyContent: 'center' }]}>
            <MaterialIcons name="check" size={10} color={Colors.onPrimary} />
          </View>
        )}
      </View>

      <View style={styles.obstacleContent}>
        <View style={styles.obstacleLeft}>
          <Text style={[styles.obstacleMile, isCurrent && { color: Colors.primaryDim }]}>
            {checkpoint.distanceMark}
          </Text>
          <Text style={styles.obstacleName}>{checkpoint.milestoneName}</Text>
        </View>
        <View style={styles.obstacleRight}>
          {isCurrent ? (
            <View style={styles.inProgressBadge}>
              <Text style={styles.inProgressText}>IN PROGRESS</Text>
            </View>
          ) : (
            <>
              <Text style={styles.statusCleared}>CLEARED</Text>
              <Text style={styles.splitTime}>{splitTime}</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function LiveRaceScreen() {
  const insets = useSafeAreaInsets();
  const gpsAnim = useRef(new Animated.Value(1)).current;
  const { raceDoc, loading } = useActiveRace();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(gpsAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(gpsAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const startedAtMs = raceDoc?.startedAt?.toMillis() ?? null;
  const elapsed = useElapsedTime(raceDoc?.finishedAt ? null : startedAtMs);
  const totalTime = raceDoc?.totalTimeMs != null
    ? (() => {
        const ms = raceDoc.totalTimeMs;
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      })()
    : null;

  const checkpoints = raceDoc?.checkpoints ?? [];
  const currentOrder = raceDoc?.currentMilestoneOrder ?? 0;
  const totalMilestones = raceDoc?.totalMilestones ?? 0;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading race data…</Text>
          </View>
        ) : !raceDoc ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="sports" size={48} color={Colors.outlineVariant} />
            <Text style={styles.emptyTitle}>NO ACTIVE RACE</Text>
            <Text style={styles.emptySubtitle}>
              Your race will appear here once you're checked in at the first milestone.
            </Text>
          </View>
        ) : (
          <>
            {/* Hero Stats Grid */}
            <View style={styles.heroGrid}>
              <View style={styles.bibContainer}>
                <View>
                  <Text style={styles.metricLabel}>ATHLETE BIB</Text>
                  <Text style={styles.bibNumber}>#{raceDoc.bibNumber}</Text>
                </View>
                <View style={styles.rankSection}>
                  <Text style={styles.metricLabel}>MILESTONES</Text>
                  <View style={styles.rankRow}>
                    <Text style={styles.rankNumber}>{currentOrder}</Text>
                    <Text style={styles.rankTotal}>/{totalMilestones}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.timeContainer}>
                <Text style={styles.timeBg}>TIME</Text>
                <Text style={styles.metricLabel}>
                  {raceDoc.finishedAt ? 'FINAL TIME' : 'ELAPSED TIME'}
                </Text>
                <View style={styles.timeRow}>
                  {raceDoc.finishedAt ? (
                    <Text style={[styles.timeMain, { color: Colors.primaryFixed }]}>{totalTime}</Text>
                  ) : (
                    <>
                      <Text style={styles.timeMain}>
                        {elapsed.length > 5 ? elapsed.slice(0, 5) : elapsed}
                      </Text>
                      {elapsed.length > 5 && (
                        <Text style={styles.timeSec}>:{elapsed.slice(-2)}</Text>
                      )}
                    </>
                  )}
                </View>
              </View>
            </View>

            {/* Course Progression */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.sectionTitle}>COURSE PROGRESSION</Text>
                <View style={styles.progressBadge}>
                  <Text style={styles.progressBadgeText}>
                    {currentOrder} / {totalMilestones} MILESTONES
                  </Text>
                </View>
              </View>
              <View style={styles.obstacleList}>
                {checkpoints.map((cp, i) => (
                  <ObstacleItem
                    key={cp.milestoneId}
                    checkpoint={cp}
                    isCurrent={i === checkpoints.length - 1 && !raceDoc.finishedAt}
                    isLast={i === checkpoints.length - 1}
                  />
                ))}
                {checkpoints.length === 0 && (
                  <Text style={styles.emptyText}>Checkpoints will appear here as you progress.</Text>
                )}
              </View>
            </View>

            {/* Live GPS indicator */}
            <View style={styles.mapSection}>
              <View style={styles.mapHeader}>
                <Text style={styles.sectionTitle}>LIVE TRACKING</Text>
                <View style={styles.gpsStatus}>
                  <Animated.View style={[styles.gpsDot, { opacity: gpsAnim }]} />
                  <Text style={styles.gpsText}>LIVE</Text>
                </View>
              </View>
              <View style={styles.mapContainer}>
                <LinearGradient colors={['#131314', '#1f1f21', '#131314']} style={styles.mapPlaceholder}>
                  <View style={styles.routeLine}>
                    {[...Array(8)].map((_, i) => (
                      <View
                        key={i}
                        style={[styles.routeSegment, {
                          opacity: i < Math.ceil((currentOrder / totalMilestones) * 8) ? 1 : 0.3,
                          backgroundColor: i < Math.ceil((currentOrder / totalMilestones) * 8)
                            ? Colors.primaryFixed : Colors.outlineVariant,
                        }]}
                      />
                    ))}
                  </View>
                  <View style={styles.userMarker}>
                    <LinearGradient colors={kineticGradient} style={styles.markerDot}>
                      <MaterialIcons name="person-pin" size={14} color={Colors.onPrimary} />
                    </LinearGradient>
                  </View>
                  <View style={styles.mapControls}>
                    <TouchableOpacity style={styles.mapControlBtn}>
                      <MaterialIcons name="add" size={20} color={Colors.onSurface} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.mapControlBtn}>
                      <MaterialIcons name="remove" size={20} color={Colors.onSurface} />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            </View>
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 16, gap: 16 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 16, paddingHorizontal: 24 },
  emptyTitle: { fontFamily: 'Inter_900Black', fontSize: 18, color: Colors.onSurface, letterSpacing: -0.5, textTransform: 'uppercase' },
  emptySubtitle: { fontFamily: 'Lexend_400Regular', fontSize: 13, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },
  emptyText: { fontFamily: 'Lexend_400Regular', fontSize: 12, color: Colors.onSurfaceVariant, textAlign: 'center' },

  heroGrid: { flexDirection: 'row', gap: 8, marginTop: 8 },
  bibContainer: { flex: 1, backgroundColor: Colors.surfaceContainerLow, padding: 20, justifyContent: 'space-between', minHeight: 180 },
  rankSection: { marginTop: 24 },
  metricLabel: { fontFamily: 'Lexend_400Regular', fontSize: 9, color: Colors.onSurfaceVariant, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 },
  bibNumber: { fontFamily: 'Inter_900Black', fontSize: 32, color: Colors.primaryFixed, letterSpacing: -1 },
  rankRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  rankNumber: { fontFamily: 'Inter_900Black', fontSize: 56, color: Colors.secondary, letterSpacing: -2, fontStyle: 'italic', lineHeight: 60 },
  rankTotal: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.onSurfaceVariant, fontStyle: 'italic' },
  timeContainer: { flex: 1.3, backgroundColor: Colors.surfaceContainerHigh, padding: 20, justifyContent: 'flex-end', overflow: 'hidden', minHeight: 180 },
  timeBg: { position: 'absolute', right: -10, top: -20, fontFamily: 'Inter_900Black', fontSize: 72, color: Colors.surfaceContainerHighest, opacity: 0.4, letterSpacing: -2 },
  timeRow: { flexDirection: 'row', alignItems: 'baseline' },
  timeMain: { fontFamily: 'Inter_900Black', fontSize: 52, color: Colors.onSurface, letterSpacing: -2, lineHeight: 56 },
  timeSec: { fontFamily: 'Inter_900Black', fontSize: 52, color: Colors.onSurface, letterSpacing: -2, lineHeight: 56 },

  progressSection: { backgroundColor: Colors.surfaceContainerLow, padding: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sectionTitle: { fontFamily: 'Lexend_700Bold', fontSize: 11, color: Colors.onSurface, letterSpacing: 3, textTransform: 'uppercase' },
  progressBadge: { backgroundColor: Colors.primaryContainer + '1A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 2 },
  progressBadgeText: { fontFamily: 'Lexend_700Bold', fontSize: 9, color: Colors.primaryContainer, letterSpacing: 2, textTransform: 'uppercase' },
  obstacleList: { gap: 0 },
  obstacleRow: { flexDirection: 'row', paddingLeft: 8, marginBottom: 24 },
  timelineLine: { position: 'absolute', left: 15, top: 16, bottom: -24, width: 2 },
  dotContainer: { width: 16, alignItems: 'center', marginRight: 16, marginTop: 2 },
  dot: { width: 16, height: 16, borderRadius: 8 },
  dotActive: { backgroundColor: Colors.background, borderWidth: 2, borderColor: Colors.primaryFixed, padding: 3 },
  dotInner: { width: 8, height: 8, borderRadius: 4 },
  obstacleContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  obstacleLeft: { flex: 1 },
  obstacleMile: { fontFamily: 'Lexend_400Regular', fontSize: 10, color: Colors.onSurfaceVariant, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 },
  obstacleName: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Colors.onSurface, letterSpacing: -0.5, textTransform: 'uppercase' },
  obstacleRight: { alignItems: 'flex-end' },
  statusCleared: { fontFamily: 'Lexend_700Bold', fontSize: 9, color: Colors.primaryFixed, letterSpacing: 2, textTransform: 'uppercase' },
  splitTime: { fontFamily: 'Lexend_400Regular', fontSize: 11, color: Colors.onSurfaceVariant },
  inProgressBadge: { borderWidth: 1, borderColor: Colors.secondary + '33', backgroundColor: Colors.secondary + '1A', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 2 },
  inProgressText: { fontFamily: 'Lexend_700Bold', fontSize: 9, color: Colors.secondary, letterSpacing: 2, textTransform: 'uppercase' },

  mapSection: { gap: 12 },
  mapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gpsStatus: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gpsDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.error },
  gpsText: { fontFamily: 'Lexend_700Bold', fontSize: 9, color: Colors.onSurfaceVariant, letterSpacing: 2, textTransform: 'uppercase' },
  mapContainer: { height: 220, borderRadius: 2, overflow: 'hidden' },
  mapPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  routeLine: { position: 'absolute', bottom: 60, left: 20, right: 20, flexDirection: 'row', gap: 4, alignItems: 'center' },
  routeSegment: { flex: 1, height: 3, borderRadius: 2 },
  userMarker: { alignItems: 'center', justifyContent: 'center' },
  markerDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primaryFixed, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 12, elevation: 8 },
  mapControls: { position: 'absolute', bottom: 12, right: 12, gap: 4 },
  mapControlBtn: { width: 36, height: 36, backgroundColor: Colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center', borderRadius: 2 },
});
