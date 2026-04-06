import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../components/TopBar';
import { Colors, kineticGradient } from '../theme/colors';
import { useActiveEvents } from '../hooks/useEvents';
import { useCompletedRaces } from '../hooks/useActiveRace';
import { useMyBib } from '../hooks/useMyBib';
import { AthleteRaceDoc, EventDoc } from '@x-track/firebase';

function formatMs(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ── Bib Info Card ─────────────────────────────────────────────────────────────

function BibInfoCard({ eventId }: { eventId: string }) {
  const bib = useMyBib(eventId);
  if (!bib) return null;
  return (
    <View style={styles.bibCard}>
      <View style={styles.bibRow}>
        <View style={styles.bibStat}>
          <Text style={styles.bibStatLabel}>BIB NUMBER</Text>
          <Text style={styles.bibStatValue}>#{bib.bibNumber}</Text>
        </View>
        <View style={styles.bibStat}>
          <Text style={styles.bibStatLabel}>WAVE</Text>
          <Text style={styles.bibStatValue}>{bib.wave}</Text>
        </View>
        <View style={styles.bibStat}>
          <Text style={styles.bibStatLabel}>CATEGORY</Text>
          <Text style={[styles.bibStatValue, { fontSize: 13 }]} numberOfLines={1}>{bib.category}</Text>
        </View>
      </View>
    </View>
  );
}

// ── Race History Bars ──────────────────────────────────────────────────────────

function RaceHistoryBars({ races }: { races: AthleteRaceDoc[] }) {
  const completed = races.filter(r => r.totalTimeMs != null).slice(0, 7);
  const maxMs = Math.max(...completed.map(r => r.totalTimeMs!), 1);
  // Pad to 7 bars
  const bars: (number | null)[] = [
    ...Array(Math.max(0, 7 - completed.length)).fill(null),
    ...completed.map(r => r.totalTimeMs!),
  ];

  return (
    <View style={styles.barChart}>
      {bars.map((ms, i) => (
        <View key={i} style={styles.barWrapper}>
          <View
            style={[
              styles.bar,
              {
                height: ms != null ? `${Math.round((ms / maxMs) * 100)}%` as any : '8%',
                backgroundColor: ms != null && i === bars.length - 1
                  ? Colors.electricOrange
                  : ms != null
                  ? Colors.surfaceContainerHighest
                  : Colors.surfaceContainerHigh,
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { events, loading: eventsLoading } = useActiveEvents();
  const { races } = useCompletedRaces();

  const lastRace = races[0] ?? null;
  const featuredEvent = events[0] ?? null;
  const otherEvents = events.slice(1);

  const totalActiveMs = races.reduce((sum, r) => sum + (r.totalTimeMs ?? 0), 0);
  const totalActiveHours = Math.floor(totalActiveMs / 3600000);
  const totalActiveMins = Math.floor((totalActiveMs % 3600000) / 60000);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Last Race Summary */}
        {lastRace ? (
          <View style={styles.lastRaceCard}>
            <View>
              <Text style={styles.cardLabel}>LAST RACE RESULT</Text>
              <Text style={styles.lastRaceTitle}>{lastRace.eventName}</Text>
            </View>
            <View style={styles.lastRaceStats}>
              <View>
                <Text style={styles.statLabel}>BIB</Text>
                <Text style={styles.statValue}>#{lastRace.bibNumber}</Text>
              </View>
              <View>
                <Text style={styles.statLabel}>TIME</Text>
                <Text style={styles.statValue}>
                  {lastRace.totalTimeMs != null ? formatMs(lastRace.totalTimeMs) : '—'}
                </Text>
              </View>
              <View>
                <Text style={styles.statLabel}>MILESTONES</Text>
                <Text style={styles.statValue}>
                  {lastRace.checkpoints.length}/{lastRace.totalMilestones}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Featured Event */}
        {featuredEvent ? (
          <View style={styles.featuredCard}>
            <LinearGradient
              colors={['#1f1f21', '#131314', '#0e0e0f']}
              style={styles.featuredBg}
            >
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
                  <Text style={styles.confirmedText}>{featuredEvent.status.toUpperCase()}</Text>
                </View>
                <Text style={styles.featuredDate}>
                  {featuredEvent.date?.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) ?? '—'}
                </Text>
              </View>
              <Text style={styles.featuredTitle}>
                {featuredEvent.name.split(' ').slice(0, -1).join('\n') || featuredEvent.name}
                {featuredEvent.name.split(' ').length > 1 && (
                  <Text style={{ color: Colors.primaryContainer }}>
                    {'\n'}{featuredEvent.name.split(' ').slice(-1)[0]}
                  </Text>
                )}
              </Text>
              <View style={styles.featuredActions}>
                <View style={styles.waveCard}>
                  <View>
                    <Text style={styles.waveLabel}>LOCATION</Text>
                    <Text style={styles.waveValue}>{featuredEvent.location}</Text>
                  </View>
                </View>
              </View>
              {/* Bib info if athlete is registered */}
              <BibInfoCard eventId={featuredEvent.id} />
            </View>
          </View>
        ) : eventsLoading ? (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading events…</Text>
          </View>
        ) : (
          <View style={styles.loadingCard}>
            <MaterialIcons name="event" size={32} color={Colors.outlineVariant} />
            <Text style={styles.loadingText}>No active events at the moment.</Text>
          </View>
        )}

        {/* Upcoming Events */}
        {otherEvents.length > 0 && (
          <View style={styles.upcomingSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>OTHER UPCOMING EVENTS</Text>
            </View>
            <View style={styles.eventGrid}>
              {otherEvents.map((event) => (
                <TouchableOpacity key={event.id} style={styles.eventCard}>
                  <View style={styles.eventImageBox}>
                    <MaterialIcons name="directions-run" size={36} color={Colors.outlineVariant} />
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventDateLoc}>
                      {event.date?.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) ?? '—'} • {event.location.toUpperCase()}
                    </Text>
                    <Text style={styles.eventName}>{event.name}</Text>
                    <View style={styles.eventStatus}>
                      <MaterialIcons name="confirmation-number" size={14} color={Colors.onSurfaceVariant} />
                      <Text style={styles.eventStatusText}>{event.status.toUpperCase()}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Performance Bento Grid */}
        <View style={styles.bentoGrid}>
          <View style={styles.bentoWide}>
            <View style={styles.bentoHeader}>
              <View>
                <Text style={styles.bentoLabel}>RACE HISTORY</Text>
                <View style={styles.bentoValueRow}>
                  <Text style={styles.bentoValue}>{races.length}</Text>
                  <Text style={styles.bentoUnit}>{races.length === 1 ? 'EVENT' : 'EVENTS'}</Text>
                </View>
                {totalActiveMs > 0 && (
                  <Text style={styles.bentoSub}>
                    TOTAL ACTIVE TIME  {totalActiveHours}h {totalActiveMins}m
                  </Text>
                )}
              </View>
              <MaterialIcons name="trending-up" size={24} color={Colors.electricOrange} />
            </View>
            <RaceHistoryBars races={races} />
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 16, gap: 16, paddingTop: 8 },

  lastRaceCard: { backgroundColor: Colors.surfaceContainerLow, padding: 20, borderRadius: 2, gap: 12, borderLeftWidth: 4, borderLeftColor: Colors.electricOrange },
  cardLabel: { fontFamily: 'Lexend_400Regular', fontSize: 9, color: Colors.onSurfaceVariant, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 2 },
  lastRaceTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.onSurface, letterSpacing: -0.5, textTransform: 'uppercase' },
  lastRaceStats: { flexDirection: 'row', gap: 24 },
  statLabel: { fontFamily: 'Lexend_400Regular', fontSize: 9, color: Colors.onSurfaceVariant, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 2 },
  statValue: { fontFamily: 'Inter_900Black', fontSize: 18, color: Colors.onSurface, letterSpacing: -1 },

  featuredCard: { height: 440, borderRadius: 2, overflow: 'hidden', backgroundColor: Colors.surfaceContainerHighest },
  featuredBg: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  featuredImagePlaceholder: { position: 'absolute', top: 40, opacity: 0.3 },
  featuredOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 260 },
  featuredContent: { flex: 1, justifyContent: 'flex-end', padding: 24, gap: 12 },
  featuredMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  confirmedBadge: { backgroundColor: Colors.primaryContainer, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 2 },
  confirmedText: { fontFamily: 'Lexend_700Bold', fontSize: 9, color: Colors.onPrimaryContainer, letterSpacing: 2, textTransform: 'uppercase' },
  featuredDate: { fontFamily: 'Lexend_400Regular', fontSize: 9, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase' },
  featuredTitle: { fontFamily: 'Inter_900Black', fontSize: 48, color: Colors.onSurface, letterSpacing: -2, fontStyle: 'italic', textTransform: 'uppercase', lineHeight: 48 },
  featuredActions: { gap: 12 },
  waveCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(19, 19, 20, 0.7)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 2 },
  waveLabel: { fontFamily: 'Lexend_400Regular', fontSize: 9, color: Colors.onSurfaceVariant, letterSpacing: 2, textTransform: 'uppercase' },
  waveValue: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Colors.onSurface, letterSpacing: -0.3 },

  bibCard: { backgroundColor: 'rgba(19,19,20,0.85)', borderRadius: 2, padding: 14, borderLeftWidth: 3, borderLeftColor: Colors.primaryFixed },
  bibRow: { flexDirection: 'row', gap: 20 },
  bibStat: { flex: 1 },
  bibStatLabel: { fontFamily: 'Lexend_400Regular', fontSize: 8, color: Colors.onSurfaceVariant, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 },
  bibStatValue: { fontFamily: 'Inter_900Black', fontSize: 16, color: Colors.primaryFixed, letterSpacing: -0.5 },

  loadingCard: { backgroundColor: Colors.surfaceContainerLow, padding: 40, borderRadius: 2, alignItems: 'center', gap: 12 },
  loadingText: { fontFamily: 'Lexend_400Regular', fontSize: 13, color: Colors.onSurfaceVariant },

  upcomingSection: { gap: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: 'Lexend_700Bold', fontSize: 10, color: Colors.onSurfaceVariant, letterSpacing: 3, textTransform: 'uppercase' },
  eventGrid: { gap: 8 },
  eventCard: { backgroundColor: Colors.surfaceContainerLow, flexDirection: 'row', borderRadius: 2, overflow: 'hidden' },
  eventImageBox: { width: 100, height: 100, backgroundColor: Colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  eventInfo: { flex: 1, padding: 14, justifyContent: 'center', gap: 4 },
  eventDateLoc: { fontFamily: 'Lexend_700Bold', fontSize: 9, color: Colors.electricOrange, letterSpacing: 2, textTransform: 'uppercase' },
  eventName: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Colors.onSurface, textTransform: 'uppercase', letterSpacing: -0.5, lineHeight: 20 },
  eventStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eventStatusText: { fontFamily: 'Lexend_400Regular', fontSize: 11, color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1 },

  bentoGrid: { gap: 8 },
  bentoWide: { backgroundColor: Colors.surfaceContainerLow, padding: 20, borderRadius: 2, borderLeftWidth: 4, borderLeftColor: Colors.electricOrange, gap: 16 },
  bentoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bentoLabel: { fontFamily: 'Lexend_700Bold', fontSize: 10, color: Colors.onSurfaceVariant, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  bentoValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  bentoValue: { fontFamily: 'Inter_900Black', fontSize: 36, color: Colors.onSurface, letterSpacing: -1 },
  bentoUnit: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.onSurfaceVariant },
  bentoSub: { fontFamily: 'Lexend_400Regular', fontSize: 9, color: Colors.electricOrange, letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 4 },
  barWrapper: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { borderRadius: 2, width: '100%' },
});
