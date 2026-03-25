import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../components/TopBar';
import { Colors, kineticGradient } from '../theme/colors';

const { width } = Dimensions.get('window');

const UPCOMING_EVENTS = [
  {
    id: 1,
    date: 'JAN 05',
    location: 'BENGALURU',
    name: 'Sunfeast World 10K',
    status: 'Registrations Open',
    statusIcon: 'confirmation-number' as const,
  },
  {
    id: 2,
    date: 'FEB 18',
    location: 'KOLHAPUR',
    name: 'Ruggedian Obstacle',
    status: 'Waitlist Only',
    statusIcon: 'confirmation-number' as const,
  },
  {
    id: 3,
    date: 'MAR 22',
    location: 'MUMBAI',
    name: 'Urban Dash 5K',
    status: 'Registrations Open',
    statusIcon: 'confirmation-number' as const,
  },
];

const WEEKLY_BARS = [40, 65, 55, 90, 45, 30, 20];

export function ExploreScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Last Race Summary */}
        <View style={styles.lastRaceCard}>
          <View>
            <Text style={styles.cardLabel}>LAST RACE RESULT</Text>
            <Text style={styles.lastRaceTitle}>SPARTAN TRIFECTA</Text>
          </View>
          <View style={styles.lastRaceStats}>
            <View>
              <Text style={styles.statLabel}>RANK</Text>
              <Text style={styles.statValue}>#124</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>TIME</Text>
              <Text style={styles.statValue}>01:42:12</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>PACE</Text>
              <Text style={styles.statValue}>
                4:48<Text style={styles.statUnit}>/km</Text>
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.viewSplitsBtn}>
            <Text style={styles.viewSplitsText}>View Splits</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Event */}
        <View style={styles.featuredCard}>
          <LinearGradient
            colors={['#1f1f21', '#131314', '#0e0e0f']}
            style={styles.featuredBg}
          >
            {/* Event image placeholder */}
            <View style={styles.featuredImagePlaceholder}>
              <MaterialIcons name="terrain" size={80} color={Colors.outlineVariant} />
            </View>
            <LinearGradient
              colors={['transparent', Colors.background]}
              style={styles.featuredOverlay}
            />
          </LinearGradient>
          <View style={styles.featuredContent}>
            <View style={styles.featuredMeta}>
              <View style={styles.confirmedBadge}>
                <Text style={styles.confirmedText}>CONFIRMED</Text>
              </View>
              <Text style={styles.featuredDate}>DEC 14, 2024</Text>
            </View>
            <Text style={styles.featuredTitle}>
              Devil Circuit{'\n'}
              <Text style={{ color: Colors.primaryContainer }}>NCR</Text>
            </Text>
            <View style={styles.featuredActions}>
              <TouchableOpacity>
                <LinearGradient colors={kineticGradient} style={styles.bibBtn}>
                  <Text style={styles.bibBtnText}>VIEW BIB INFO</Text>
                </LinearGradient>
              </TouchableOpacity>
              <View style={styles.waveCard}>
                <View>
                  <Text style={styles.waveLabel}>WAVE</Text>
                  <Text style={styles.waveValue}>ELITE 07:00</Text>
                </View>
                <View style={styles.waveDivider} />
                <View>
                  <Text style={styles.waveLabel}>DISTANCE</Text>
                  <Text style={styles.waveValue}>15 KM</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.upcomingSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>OTHER UPCOMING EVENTS</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.eventGrid}>
            {UPCOMING_EVENTS.map(event => (
              <TouchableOpacity key={event.id} style={styles.eventCard}>
                <View style={styles.eventImageBox}>
                  <MaterialIcons name="directions-run" size={36} color={Colors.outlineVariant} />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventDateLoc}>
                    {event.date} • {event.location}
                  </Text>
                  <Text style={styles.eventName}>{event.name}</Text>
                  <View style={styles.eventStatus}>
                    <MaterialIcons
                      name={event.statusIcon}
                      size={14}
                      color={Colors.onSurfaceVariant}
                    />
                    <Text style={styles.eventStatusText}>{event.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Performance Bento Grid */}
        <View style={styles.bentoGrid}>
          {/* Weekly Training Load */}
          <View style={styles.bentoWide}>
            <View style={styles.bentoHeader}>
              <View>
                <Text style={styles.bentoLabel}>WEEKLY TRAINING LOAD</Text>
                <View style={styles.bentoValueRow}>
                  <Text style={styles.bentoValue}>42.5</Text>
                  <Text style={styles.bentoUnit}>KM</Text>
                </View>
              </View>
              <MaterialIcons name="trending-up" size={24} color={Colors.electricOrange} />
            </View>
            <View style={styles.barChart}>
              {WEEKLY_BARS.map((h, i) => (
                <View key={i} style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${h}%`,
                        backgroundColor:
                          i === 3 ? Colors.electricOrange : Colors.surfaceContainerHighest,
                      },
                    ]}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Total Race Time */}
          <View style={styles.bentoSmall}>
            <MaterialIcons name="timer" size={24} color={Colors.electricOrange} />
            <View>
              <Text style={styles.bentoLabel}>TOTAL RACE TIME</Text>
              <Text style={[styles.bentoValue, { fontSize: 28 }]}>84h 12m</Text>
            </View>
            <View style={styles.bentoDivider} />
            <Text style={styles.bentoNote}>Top 5% of all-time participants in X-Track ecosystem.</Text>
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
    gap: 16,
    paddingTop: 8,
  },

  // Last Race Card
  lastRaceCard: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: 20,
    borderRadius: 2,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.electricOrange,
  },
  cardLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  lastRaceTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.onSurface,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  lastRaceStats: {
    flexDirection: 'row',
    gap: 24,
  },
  statLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statValue: {
    fontFamily: 'Inter_900Black',
    fontSize: 22,
    color: Colors.onSurface,
    letterSpacing: -1,
  },
  statUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  viewSplitsBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.electricOrange + '33',
  },
  viewSplitsText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 11,
    color: Colors.electricOrange,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Featured Event
  featuredCard: {
    height: 400,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceContainerHighest,
  },
  featuredBg: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredImagePlaceholder: {
    position: 'absolute',
    top: 40,
    opacity: 0.3,
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  featuredContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    gap: 16,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  confirmedBadge: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 2,
  },
  confirmedText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: Colors.onPrimaryContainer,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  featuredDate: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  featuredTitle: {
    fontFamily: 'Inter_900Black',
    fontSize: 52,
    color: Colors.onSurface,
    letterSpacing: -2,
    fontStyle: 'italic',
    textTransform: 'uppercase',
    lineHeight: 52,
  },
  featuredActions: {
    gap: 12,
  },
  bibBtn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 2,
    alignItems: 'center',
    shadowColor: Colors.electricOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  bibBtnText: {
    fontFamily: 'Inter_900Black',
    fontSize: 13,
    color: Colors.onPrimaryFixed,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  waveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(19, 19, 20, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 2,
    gap: 20,
  },
  waveLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  waveValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  waveDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.outlineVariant,
  },

  // Upcoming Events
  upcomingSection: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  seeAllText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 10,
    color: Colors.electricOrange,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  eventGrid: {
    gap: 8,
  },
  eventCard: {
    backgroundColor: Colors.surfaceContainerLow,
    flexDirection: 'row',
    borderRadius: 2,
    overflow: 'hidden',
  },
  eventImageBox: {
    width: 100,
    height: 100,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
    gap: 4,
  },
  eventDateLoc: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: Colors.electricOrange,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  eventName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.onSurface,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    lineHeight: 20,
  },
  eventStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventStatusText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Bento grid
  bentoGrid: {
    gap: 8,
  },
  bentoWide: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: 20,
    borderRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: Colors.electricOrange,
    gap: 16,
  },
  bentoSmall: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: 20,
    borderRadius: 2,
    gap: 12,
  },
  bentoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bentoLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bentoValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  bentoValue: {
    fontFamily: 'Inter_900Black',
    fontSize: 36,
    color: Colors.onSurface,
    letterSpacing: -1,
  },
  bentoUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    gap: 4,
  },
  barWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: 2,
    width: '100%',
  },
  bentoDivider: {
    height: 1,
    backgroundColor: Colors.outlineVariant,
  },
  bentoNote: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    lineHeight: 16,
  },
});
