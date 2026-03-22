import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../components/TopBar';
import { Colors, kineticGradient } from '../theme/colors';

const { width } = Dimensions.get('window');

const OBSTACLES = [
  { id: 1, mile: '0.8 MILE', name: 'The Mud Pit', status: 'cleared', split: '14:02 SPLIT' },
  { id: 2, mile: '1.4 MILES', name: 'The Great Wall', status: 'inprogress', split: '' },
  { id: 3, mile: '2.1 MILES', name: 'Barbed Wire Crawl', status: 'upcoming', split: '' },
  { id: 4, mile: '2.8 MILES', name: 'Rope Climb', status: 'upcoming', split: '' },
  { id: 5, mile: '3.1 MILES', name: 'Finish Line', status: 'finish', split: '' },
];

function ObstacleItem({ obstacle, isLast }: { obstacle: typeof OBSTACLES[0]; isLast: boolean }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (obstacle.status === 'inprogress') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [obstacle.status]);

  const isCleared = obstacle.status === 'cleared';
  const isActive = obstacle.status === 'inprogress';
  const isFinish = obstacle.status === 'finish';
  const isDimmed = obstacle.status === 'upcoming' || isFinish;

  return (
    <View style={styles.obstacleRow}>
      {/* Timeline line */}
      {!isLast && (
        <View
          style={[
            styles.timelineLine,
            { backgroundColor: isCleared || isActive ? Colors.primary : Colors.outlineVariant },
          ]}
        />
      )}

      {/* Dot */}
      <View style={styles.dotContainer}>
        {isCleared ? (
          <LinearGradient colors={kineticGradient} style={styles.dot}>
            <MaterialIcons name="check" size={10} color={Colors.onPrimary} />
          </LinearGradient>
        ) : isActive ? (
          <Animated.View style={[styles.dot, styles.dotActive, { opacity: pulseAnim }]}>
            <LinearGradient colors={kineticGradient} style={styles.dotInner} />
          </Animated.View>
        ) : (
          <View style={[styles.dot, styles.dotUpcoming]}>
            {isFinish && <MaterialIcons name="flag" size={10} color={Colors.onSurfaceVariant} />}
          </View>
        )}
      </View>

      {/* Content */}
      <View style={[styles.obstacleContent, isDimmed && styles.dimmed]}>
        <View style={styles.obstacleLeft}>
          <Text style={[styles.obstacleMile, isActive && { color: Colors.primaryDim }]}>
            {obstacle.mile}
          </Text>
          <Text style={styles.obstacleName}>{obstacle.name}</Text>
        </View>
        <View style={styles.obstacleRight}>
          {isCleared && (
            <>
              <Text style={styles.statusCleared}>CLEARED</Text>
              <Text style={styles.splitTime}>{obstacle.split}</Text>
            </>
          )}
          {isActive && (
            <View style={styles.inProgressBadge}>
              <Text style={styles.inProgressText}>IN PROGRESS</Text>
            </View>
          )}
          {isDimmed && !isFinish && <Text style={styles.statusUpcoming}>UPCOMING</Text>}
        </View>
      </View>
    </View>
  );
}

export function LiveRaceScreen() {
  const insets = useSafeAreaInsets();
  const gpsAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(gpsAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(gpsAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Hero Stats Grid */}
        <View style={styles.heroGrid}>
          {/* Bib & Rank */}
          <View style={styles.bibContainer}>
            <View>
              <Text style={styles.metricLabel}>ATHLETE BIB</Text>
              <Text style={styles.bibNumber}>#2481</Text>
            </View>
            <View style={styles.rankSection}>
              <Text style={styles.metricLabel}>CURRENT RANK</Text>
              <View style={styles.rankRow}>
                <Text style={styles.rankNumber}>14</Text>
                <Text style={styles.rankTotal}>/850</Text>
              </View>
            </View>
          </View>

          {/* Elapsed Time */}
          <View style={styles.timeContainer}>
            <Text style={styles.timeBg}>TIME</Text>
            <Text style={styles.metricLabel}>ELAPSED TIME</Text>
            <View style={styles.timeRow}>
              <Text style={styles.timeMain}>01:42</Text>
              <Text style={styles.timeSec}>:08</Text>
            </View>
          </View>
        </View>

        {/* Course Progression */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>COURSE PROGRESSION</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>6 / 12 OBSTACLES</Text>
            </View>
          </View>
          <View style={styles.obstacleList}>
            {OBSTACLES.map((o, i) => (
              <ObstacleItem key={o.id} obstacle={o} isLast={i === OBSTACLES.length - 1} />
            ))}
          </View>
        </View>

        {/* Live Course View */}
        <View style={styles.mapSection}>
          <View style={styles.mapHeader}>
            <Text style={styles.sectionTitle}>LIVE COURSE VIEW</Text>
            <View style={styles.gpsStatus}>
              <Animated.View style={[styles.gpsDot, { opacity: gpsAnim }]} />
              <Text style={styles.gpsText}>LIVE GPS CONNECTED</Text>
            </View>
          </View>

          <View style={styles.mapContainer}>
            <LinearGradient
              colors={['#131314', '#1f1f21', '#131314']}
              style={styles.mapPlaceholder}
            >
              {/* Route visualization */}
              <View style={styles.routeLine}>
                {[...Array(8)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.routeSegment,
                      { opacity: i < 5 ? 1 : 0.3, backgroundColor: i < 5 ? Colors.primary : Colors.outlineVariant },
                    ]}
                  />
                ))}
              </View>

              {/* User marker */}
              <View style={styles.userMarker}>
                <LinearGradient colors={kineticGradient} style={styles.markerDot}>
                  <MaterialIcons name="person-pin" size={14} color={Colors.onPrimary} />
                </LinearGradient>
              </View>

              {/* Next turn card */}
              <View style={styles.nextTurnCard}>
                <Text style={styles.nextTurnLabel}>NEXT TURN</Text>
                <Text style={styles.nextTurnValue}>400m - Sharp Left</Text>
              </View>

              {/* Map controls */}
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

        {/* Bottom padding */}
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
    gap: 16,
  },

  // Hero grid
  heroGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  bibContainer: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    padding: 20,
    justifyContent: 'space-between',
    minHeight: 180,
  },
  rankSection: {
    marginTop: 24,
  },
  metricLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bibNumber: {
    fontFamily: 'Inter_900Black',
    fontSize: 32,
    color: Colors.onSurface,
    letterSpacing: -1,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  rankNumber: {
    fontFamily: 'Inter_900Black',
    fontSize: 56,
    color: Colors.primary,
    letterSpacing: -2,
    fontStyle: 'italic',
    lineHeight: 60,
  },
  rankTotal: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  timeContainer: {
    flex: 1.3,
    backgroundColor: Colors.surfaceContainerHigh,
    padding: 20,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    minHeight: 180,
  },
  timeBg: {
    position: 'absolute',
    right: -10,
    top: -20,
    fontFamily: 'Inter_900Black',
    fontSize: 72,
    color: Colors.surfaceContainerHighest,
    opacity: 0.4,
    letterSpacing: -2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  timeMain: {
    fontFamily: 'Inter_900Black',
    fontSize: 52,
    color: Colors.onSurface,
    letterSpacing: -2,
    lineHeight: 56,
  },
  timeSec: {
    fontFamily: 'Inter_900Black',
    fontSize: 52,
    color: Colors.primary,
    letterSpacing: -2,
    lineHeight: 56,
  },

  // Course progression
  progressSection: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 11,
    color: Colors.onSurface,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  progressBadge: {
    backgroundColor: Colors.primary + '1A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,
  },
  progressBadgeText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: Colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  obstacleList: {
    gap: 0,
  },
  obstacleRow: {
    flexDirection: 'row',
    paddingLeft: 8,
    marginBottom: 24,
  },
  timelineLine: {
    position: 'absolute',
    left: 15,
    top: 16,
    bottom: -24,
    width: 2,
  },
  dotContainer: {
    width: 16,
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    backgroundColor: Colors.primary,
    padding: 3,
  },
  dotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotUpcoming: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
  },
  obstacleContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dimmed: {
    opacity: 0.4,
  },
  obstacleLeft: {
    flex: 1,
  },
  obstacleMile: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  obstacleName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.onSurface,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  obstacleRight: {
    alignItems: 'flex-end',
  },
  statusCleared: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: Colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  splitTime: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  inProgressBadge: {
    borderWidth: 1,
    borderColor: Colors.primary + '33',
    backgroundColor: Colors.primaryContainer + '33',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 2,
  },
  inProgressText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: Colors.onSurface,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  statusUpcoming: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Map
  mapSection: {
    gap: 12,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gpsStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gpsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  gpsText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  mapContainer: {
    height: 220,
    borderRadius: 2,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeLine: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  routeSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  userMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  nextTurnCard: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(19, 19, 20, 0.7)',
    padding: 10,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  nextTurnLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: Colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  nextTurnValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: Colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: -0.3,
  },
  mapControls: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    gap: 4,
  },
  mapControlBtn: {
    width: 36,
    height: 36,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
});
