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
import { useMilestones } from '../hooks/useMilestones';
import { useCategoryWeights } from '../hooks/useCategoryWeights';
import { useMyBib } from '../hooks/useMyBib';
import { MilestoneDoc, CheckpointEntry } from '@x-track/firebase';

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

// ── Milestone row statuses ────────────────────────────────────────────────────

type MilestoneStatus = 'cleared' | 'in_progress' | 'upcoming';

interface MilestoneRowProps {
  milestone: MilestoneDoc;
  status: MilestoneStatus;
  checkpoint: CheckpointEntry | undefined;
  weight: number | null | undefined;  // category weight for this milestone
  isLast: boolean;
}

function MilestoneRow({ milestone, status, checkpoint, weight, isLast }: MilestoneRowProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'in_progress') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status]);

  const splitTime = checkpoint?.scannedAt
    ? checkpoint.scannedAt.toDate().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '';

  // Metadata tags: weight (kg) for stations, distanceMark for all
  const metaTags: string[] = [];
  if (milestone.distanceMark) metaTags.push(milestone.distanceMark);
  if (milestone.stationType === 'station' && weight != null) metaTags.push(`${weight} KG`);
  if (milestone.repTarget != null) metaTags.push(`${milestone.repTarget} REPS`);

  const isUpcoming = status === 'upcoming';

  return (
    <View style={styles.milestoneRow}>
      {/* Timeline connector */}
      {!isLast && (
        <View style={[
          styles.timelineLine,
          { backgroundColor: status === 'cleared' ? Colors.primaryFixed : Colors.outlineVariant },
        ]} />
      )}

      {/* Dot */}
      <View style={styles.dotContainer}>
        {status === 'cleared' && (
          <View style={[styles.dot, { backgroundColor: Colors.primaryFixed, alignItems: 'center', justifyContent: 'center' }]}>
            <MaterialIcons name="check" size={10} color={Colors.onPrimary} />
          </View>
        )}
        {status === 'in_progress' && (
          <Animated.View style={[styles.dot, styles.dotActive, { opacity: pulseAnim }]}>
            <View style={[styles.dotInner, { backgroundColor: Colors.primaryFixed }]} />
          </Animated.View>
        )}
        {status === 'upcoming' && (
          <View style={[styles.dot, { backgroundColor: Colors.surfaceContainerHighest, borderWidth: 1, borderColor: Colors.outlineVariant }]} />
        )}
      </View>

      {/* Content */}
      <View style={[styles.milestoneContent, isUpcoming && { opacity: 0.45 }]}>
        <View style={styles.milestoneLeft}>
          <View style={styles.milestoneNameRow}>
            <Text style={[
              styles.milestoneName,
              status === 'in_progress' && { color: Colors.primaryFixed },
            ]}>
              {milestone.name.toUpperCase()}
            </Text>
            {status === 'in_progress' && (
              <View style={styles.inProgressBadge}>
                <Text style={styles.inProgressText}>IN PROGRESS</Text>
              </View>
            )}
          </View>
          {metaTags.length > 0 && (
            <View style={styles.metaTagRow}>
              {metaTags.map((tag, i) => (
                <View key={i} style={[
                  styles.metaTag,
                  i === metaTags.length - 1 && weight != null && milestone.stationType === 'station' && { borderColor: Colors.electricOrange + '80', backgroundColor: Colors.electricOrange + '12' },
                ]}>
                  <Text style={[
                    styles.metaTagText,
                    i === metaTags.length - 1 && weight != null && milestone.stationType === 'station' && { color: Colors.electricOrange },
                  ]}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.milestoneRight}>
          {status === 'cleared' && (
            <>
              <Text style={styles.statusCleared}>CLEARED</Text>
              {splitTime ? <Text style={styles.splitTime}>{splitTime}</Text> : null}
              {checkpoint?.repCount != null && (
                <Text style={styles.splitTime}>{checkpoint.repCount} reps</Text>
              )}
            </>
          )}
          {status === 'upcoming' && (
            <Text style={styles.statusUpcoming}>UPCOMING</Text>
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

  const eventId = raceDoc?.eventId ?? null;
  const { milestones } = useMilestones(eventId);

  // Get athlete's bib to determine category
  const bib = useMyBib(eventId);
  const categoryWeights = useCategoryWeights(eventId, bib?.category ?? null);

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

  // Build checkpoint lookup map keyed by milestoneId
  const checkpointMap = new Map<string, CheckpointEntry>();
  (raceDoc?.checkpoints ?? []).forEach((cp) => checkpointMap.set(cp.milestoneId, cp));

  const currentOrder = raceDoc?.currentMilestoneOrder ?? 0;
  const totalMilestones = milestones.length || raceDoc?.totalMilestones || 0;

  // Determine status for each milestone
  const getMilestoneStatus = (m: MilestoneDoc): MilestoneStatus => {
    if (checkpointMap.has(m.id)) return 'cleared';
    if (!raceDoc?.finishedAt && m.order === currentOrder + 1) return 'in_progress';
    return 'upcoming';
  };

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
                {bib && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{bib.category.toUpperCase().replace(/_/g, ' ')}</Text>
                  </View>
                )}
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

            {/* Course Progression — ALL milestones */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.sectionTitle}>COURSE PROGRESSION</Text>
                <View style={styles.progressBadge}>
                  <Text style={styles.progressBadgeText}>
                    {currentOrder} / {totalMilestones} {totalMilestones === 1 ? 'OBSTACLE' : 'OBSTACLES'}
                  </Text>
                </View>
              </View>

              <View style={styles.milestoneList}>
                {milestones.map((m, i) => (
                  <MilestoneRow
                    key={m.id}
                    milestone={m}
                    status={getMilestoneStatus(m)}
                    checkpoint={checkpointMap.get(m.id)}
                    weight={categoryWeights[m.id]}
                    isLast={i === milestones.length - 1}
                  />
                ))}
                {milestones.length === 0 && (
                  <Text style={styles.emptyText}>Course details will appear here.</Text>
                )}
              </View>
            </View>

            {/* Live GPS indicator */}
            <View style={styles.mapSection}>
              <View style={styles.mapHeader}>
                <Text style={styles.sectionTitle}>LIVE COURSE VIEW</Text>
                <View style={styles.gpsStatus}>
                  <Animated.View style={[styles.gpsDot, { opacity: gpsAnim }]} />
                  <Text style={styles.gpsText}>LIVE GPS CONNECTED</Text>
                </View>
              </View>
              <View style={styles.mapContainer}>
                <LinearGradient colors={['#131314', '#1f1f21', '#131314']} style={styles.mapPlaceholder}>
                  {/* Next obstacle hint */}
                  {milestones.find((m) => getMilestoneStatus(m) === 'in_progress') && (
                    <View style={styles.nextTurnCard}>
                      <Text style={styles.nextTurnLabel}>NEXT TURN</Text>
                      <Text style={styles.nextTurnValue}>400M - SHARP LEFT</Text>
                    </View>
                  )}
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
  rankSection: { marginTop: 16 },
  categoryBadge: { borderWidth: 1, borderColor: Colors.outlineVariant, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 2, alignSelf: 'flex-start', marginTop: 8 },
  categoryText: { fontFamily: 'Lexend_700Bold', fontSize: 8, color: Colors.onSurfaceVariant, letterSpacing: 2 },
  metricLabel: { fontFamily: 'Lexend_400Regular', fontSize: 9, color: Colors.onSurfaceVariant, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 },
  bibNumber: { fontFamily: 'Inter_900Black', fontSize: 32, color: Colors.primaryFixed, letterSpacing: -1 },
  rankRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  rankNumber: { fontFamily: 'Inter_900Black', fontSize: 48, color: Colors.secondary, letterSpacing: -2, fontStyle: 'italic', lineHeight: 52 },
  rankTotal: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Colors.onSurfaceVariant, fontStyle: 'italic' },
  timeContainer: { flex: 1.3, backgroundColor: Colors.surfaceContainerHigh, padding: 20, justifyContent: 'flex-end', overflow: 'hidden', minHeight: 180 },
  timeBg: { position: 'absolute', right: -10, top: -20, fontFamily: 'Inter_900Black', fontSize: 72, color: Colors.surfaceContainerHighest, opacity: 0.4, letterSpacing: -2 },
  timeRow: { flexDirection: 'row', alignItems: 'baseline' },
  timeMain: { fontFamily: 'Inter_900Black', fontSize: 48, color: Colors.onSurface, letterSpacing: -2, lineHeight: 52 },
  timeSec: { fontFamily: 'Inter_900Black', fontSize: 48, color: Colors.onSurface, letterSpacing: -2, lineHeight: 52 },

  progressSection: { backgroundColor: Colors.surfaceContainerLow, padding: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sectionTitle: { fontFamily: 'Lexend_700Bold', fontSize: 11, color: Colors.onSurface, letterSpacing: 3, textTransform: 'uppercase' },
  progressBadge: { backgroundColor: Colors.primaryContainer + '1A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 2 },
  progressBadgeText: { fontFamily: 'Lexend_700Bold', fontSize: 9, color: Colors.primaryContainer, letterSpacing: 2, textTransform: 'uppercase' },
  milestoneList: { gap: 0 },

  milestoneRow: { flexDirection: 'row', paddingLeft: 8, marginBottom: 24 },
  timelineLine: { position: 'absolute', left: 15, top: 16, bottom: -24, width: 2 },
  dotContainer: { width: 16, alignItems: 'center', marginRight: 16, marginTop: 2 },
  dot: { width: 16, height: 16, borderRadius: 8 },
  dotActive: { backgroundColor: Colors.background, borderWidth: 2, borderColor: Colors.primaryFixed, padding: 3 },
  dotInner: { width: 8, height: 8, borderRadius: 4 },

  milestoneContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  milestoneLeft: { flex: 1, gap: 6 },
  milestoneNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  milestoneName: { fontFamily: 'Inter_700Bold', fontSize: 15, color: Colors.onSurface, letterSpacing: -0.3 },
  inProgressBadge: { borderWidth: 1, borderColor: Colors.primaryFixed + '60', backgroundColor: Colors.primaryFixed + '12', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 2 },
  inProgressText: { fontFamily: 'Lexend_700Bold', fontSize: 8, color: Colors.primaryFixed, letterSpacing: 2, textTransform: 'uppercase' },

  metaTagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  metaTag: { borderWidth: 1, borderColor: Colors.outlineVariant, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 },
  metaTagText: { fontFamily: 'Lexend_700Bold', fontSize: 8, color: Colors.onSurfaceVariant, letterSpacing: 1.5, textTransform: 'uppercase' },

  milestoneRight: { alignItems: 'flex-end', gap: 2, paddingLeft: 8 },
  statusCleared: { fontFamily: 'Lexend_700Bold', fontSize: 9, color: Colors.primaryFixed, letterSpacing: 2, textTransform: 'uppercase' },
  statusUpcoming: { fontFamily: 'Lexend_400Regular', fontSize: 9, color: Colors.outlineVariant, letterSpacing: 2, textTransform: 'uppercase' },
  splitTime: { fontFamily: 'Lexend_400Regular', fontSize: 11, color: Colors.onSurfaceVariant },

  mapSection: { gap: 12 },
  mapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gpsStatus: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gpsDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.electricOrange },
  gpsText: { fontFamily: 'Lexend_700Bold', fontSize: 9, color: Colors.onSurfaceVariant, letterSpacing: 2, textTransform: 'uppercase' },
  mapContainer: { height: 240, borderRadius: 2, overflow: 'hidden' },
  mapPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  nextTurnCard: { position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(19,19,20,0.9)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 2, borderLeftWidth: 3, borderLeftColor: Colors.electricOrange },
  nextTurnLabel: { fontFamily: 'Lexend_700Bold', fontSize: 8, color: Colors.electricOrange, letterSpacing: 2, textTransform: 'uppercase' },
  nextTurnValue: { fontFamily: 'Inter_700Bold', fontSize: 13, color: Colors.onSurface, letterSpacing: -0.3, marginTop: 2 },
  routeLine: { position: 'absolute', bottom: 60, left: 20, right: 20, flexDirection: 'row', gap: 4, alignItems: 'center' },
  routeSegment: { flex: 1, height: 3, borderRadius: 2 },
  userMarker: { alignItems: 'center', justifyContent: 'center' },
  markerDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primaryFixed, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 12, elevation: 8 },
  mapControls: { position: 'absolute', bottom: 12, right: 12, gap: 4 },
  mapControlBtn: { width: 36, height: 36, backgroundColor: Colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center', borderRadius: 2 },
});
