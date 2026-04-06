import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@x-track/firebase';
import { useAuth } from '../context/AuthContext';
import NumericKeypad from '../components/NumericKeypad';
import ActiveBoard, { BoardEntry } from '../components/ActiveBoard';
import ActivityModal from '../components/ActivityModal';

let _nextId = 0;
const nextId = () => String(++_nextId);

interface MilestoneSlim {
  id: string;
  name: string;
  order: number;
  distanceMark: string;
  stationType: string;
  requiresRepCount: boolean;
  repTarget: number | null;
}

interface CategorySlim {
  id: string;
  name: string;
  milestoneWeights: Record<string, number | null>;
}

interface RecentEntry {
  id: string;
  bibNumber: string;
  milestoneName: string;
  repCount: number | null;
  timeMs: number | null;
  scannedAt: any;
}

const MAX_BOARD = 3;

export default function ManualEntryScreen() {
  const insets = useSafeAreaInsets();
  const { user, userDoc } = useAuth();

  const eventId = userDoc?.assignedEventId ?? '';
  const preselectedMilestoneId = userDoc?.assignedMilestoneId ?? '';

  const [milestones, setMilestones] = useState<MilestoneSlim[]>([]);
  const [categories, setCategories] = useState<CategorySlim[]>([]);
  const [eventName, setEventName] = useState('');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(preselectedMilestoneId);
  const [bibInput, setBibInput] = useState('');
  const [bibError, setBibError] = useState<string | null>(null);
  const [boardEntries, setBoardEntries] = useState<BoardEntry[]>([]);
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([]);
  const [modalEntry, setModalEntry] = useState<BoardEntry | null>(null);

  // Load milestones + event name once
  useEffect(() => {
    if (!eventId) return;
    const load = async () => {
      try {
        const [eventSnap, milestonesSnap, categoriesSnap] = await Promise.all([
          getDoc(doc(db, 'events', eventId)),
          getDocs(query(collection(db, `events/${eventId}/milestones`), orderBy('order', 'asc'))),
          getDocs(collection(db, `events/${eventId}/categories`)).catch(() => ({ docs: [] as any[] })),
        ]);
        setEventName(eventSnap.data()?.name ?? '');
        const ms: MilestoneSlim[] = milestonesSnap.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
          order: d.data().order,
          distanceMark: d.data().distanceMark,
          stationType: d.data().stationType ?? 'station',
          requiresRepCount: d.data().requiresRepCount ?? false,
          repTarget: d.data().repTarget ?? null,
        }));
        setMilestones(ms);
        setCategories(categoriesSnap.docs.map((d) => ({
          id: d.id,
          name: d.data().name as string,
          milestoneWeights: (d.data().milestoneWeights ?? {}) as Record<string, number | null>,
        })));

        if (preselectedMilestoneId && ms.some((m) => m.id === preselectedMilestoneId)) {
          setSelectedMilestoneId(preselectedMilestoneId);
        } else if (ms.length > 0 && !selectedMilestoneId) {
          setSelectedMilestoneId(ms[0].id);
        }
      } catch (err) {
        console.error('[ManualEntry] Failed to load event data:', err);
      }
    };
    load();
  }, [eventId]);

  // Real-time recent checkpoints (last 10, this volunteer)
  useEffect(() => {
    if (!eventId || !user?.uid) return;
    const q = query(
      collection(db, 'checkpoints'),
      where('eventId', '==', eventId),
      where('volunteerUid', '==', user.uid),
      orderBy('scannedAt', 'desc'),
      limit(10)
    );
    const unsub = onSnapshot(q, (snap) => {
      const entries: RecentEntry[] = snap.docs.map((d) => ({
        id: d.id,
        bibNumber: d.data().bibNumber,
        milestoneName:
          milestones.find((m) => m.id === d.data().milestoneId)?.name ??
          d.data().milestoneId,
        repCount: d.data().repCount ?? null,
        timeMs: d.data().timeMs ?? null,
        scannedAt: d.data().scannedAt,
      }));
      setRecentEntries(entries);
    });
    return unsub;
  }, [eventId, user?.uid, milestones]);

  const showBibError = useCallback((msg: string) => {
    setBibError(msg);
    setTimeout(() => setBibError(null), 1800);
  }, []);

  const selectedMilestone = milestones.find((m) => m.id === selectedMilestoneId);
  const pendingCount = boardEntries.filter((e) => e.status === 'pending' || e.status === 'confirming').length;
  const boardFull = pendingCount >= MAX_BOARD;
  const canAdd = !!selectedMilestoneId && bibInput.length > 0 && !boardFull;

  const handleAddToBoard = async () => {
    if (!canAdd || !selectedMilestone) return;

    const bib = bibInput.trim();

    if (boardEntries.some((e) => e.bibNumber === bib && e.milestoneId === selectedMilestoneId)) {
      showBibError('Already on board for this station');
      return;
    }

    const bibSnap = await getDoc(doc(db, `events/${eventId}/bibs`, bib));
    if (!bibSnap.exists()) {
      showBibError(`BIB ${bib} not found`);
      return;
    }

    const bibData = bibSnap.data();
    if (bibData.active === false) {
      showBibError(`BIB ${bib} is inactive`);
      return;
    }

    const athleteCategory = (bibData.category ?? '') as string;
    const catDoc = categories.find(
      (c) => c.name.toLowerCase() === athleteCategory.toLowerCase()
    );
    const categoryWeight = catDoc?.milestoneWeights[selectedMilestoneId] ?? null;

    const entry: BoardEntry = {
      id: nextId(),
      bibNumber: bib,
      athleteUid: bibData.athleteUid ?? '',
      athleteName: bibData.athleteName ?? '',
      wave: bibData.wave ?? '',
      category: athleteCategory,
      categoryWeight,
      milestoneId: selectedMilestoneId,
      milestoneName: selectedMilestone.name,
      stationType: selectedMilestone.stationType,
      requiresRepCount: selectedMilestone.requiresRepCount,
      repTarget: selectedMilestone.repTarget,
      status: 'pending',
    };

    setBoardEntries((prev) => [...prev, entry]);
    setBibInput('');
  };

  // Opens the activity modal for a board entry
  const handleLogResult = (entry: BoardEntry) => {
    setModalEntry(entry);
  };

  // Called when volunteer confirms in the modal
  const handleModalConfirm = async (
    entry: BoardEntry,
    value: { repCount?: number; timeMs?: number }
  ) => {
    setModalEntry(null);
    setBoardEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, status: 'confirming' } : e))
    );

    try {
      const checkpointId = `${eventId}_${entry.milestoneId}_${entry.bibNumber}`;
      await setDoc(
        doc(db, 'checkpoints', checkpointId),
        {
          eventId,
          milestoneId: entry.milestoneId,
          bibNumber: entry.bibNumber,
          athleteUid: entry.athleteUid,
          volunteerUid: user!.uid,
          repCount: value.repCount ?? null,
          timeMs: value.timeMs ?? null,
          entryMethod: 'manual',
          scannedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setBoardEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, status: 'done' } : e))
      );
      setTimeout(() => {
        setBoardEntries((prev) => prev.filter((e) => e.id !== entry.id));
      }, 1500);
    } catch (err) {
      console.error('[ManualEntry] Checkpoint write failed:', err);
      setBoardEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, status: 'error' } : e))
      );
      setTimeout(() => {
        setBoardEntries((prev) =>
          prev.map((e) => (e.id === entry.id ? { ...e, status: 'pending' } : e))
        );
      }, 2000);
    }
  };

  const handleRemove = (id: string) => {
    setBoardEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  };

  if (!eventId) {
    return (
      <View style={styles.center}>
        <Text style={styles.noEventText}>No event assigned.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>X-TRACK</Text>
        <View style={styles.headerMeta}>
          <Text style={styles.eventName} numberOfLines={1}>{eventName}</Text>
          <View style={styles.chip}>
            <Text style={styles.chipText}>VOLUNTEER</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Milestone picker */}
        <Text style={styles.sectionLabel}>SELECT STATION</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.milestoneScroll}
          contentContainerStyle={styles.milestoneScrollContent}
        >
          {milestones.map((m) => {
            const active = m.id === selectedMilestoneId;
            return (
              <TouchableOpacity
                key={m.id}
                onPress={() => setSelectedMilestoneId(m.id)}
                activeOpacity={0.7}
                style={[styles.milestonePill, active && styles.milestonePillActive]}
              >
                <Text style={[styles.milestonePillOrder, active && styles.milestonePillTextActive]}>
                  {m.order}
                </Text>
                <Text style={[styles.milestonePillName, active && styles.milestonePillTextActive]}>
                  {m.name}
                </Text>
                {m.stationType === 'run' && (
                  <MaterialIcons
                    name="timer"
                    size={10}
                    color={active ? '#3a4a00' : '#00eefc'}
                    style={{ marginLeft: 3 }}
                  />
                )}
                {m.requiresRepCount && (
                  <MaterialIcons
                    name="format-list-numbered"
                    size={10}
                    color={active ? '#3a4a00' : '#cafd00'}
                    style={{ marginLeft: 3 }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* BIB entry */}
        <Text style={styles.sectionLabel}>ENTER BIB NUMBER</Text>
        <NumericKeypad
          value={bibInput}
          onChange={setBibInput}
          onSubmit={handleAddToBoard}
          submitLabel={
            !selectedMilestoneId
              ? 'SELECT STATION FIRST'
              : boardFull
              ? 'BOARD FULL'
              : 'ADD TO BOARD'
          }
          submitDisabled={!canAdd}
          error={bibError}
        />

        {/* Active board */}
        <View style={styles.boardHeader}>
          <Text style={styles.sectionLabel}>ACTIVE BOARD</Text>
          <Text style={styles.boardCount}>
            {pendingCount}/{MAX_BOARD}
          </Text>
        </View>
        <ActiveBoard
          entries={boardEntries}
          onLogResult={handleLogResult}
          onRemove={handleRemove}
        />

        {/* Recent log */}
        {recentEntries.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>RECENT LOG</Text>
            {recentEntries.map((entry) => (
              <View key={entry.id} style={styles.recentRow}>
                <Text style={styles.recentBib}>{entry.bibNumber}</Text>
                <Text style={styles.recentMilestone}>{entry.milestoneName}</Text>
                {entry.repCount !== null && (
                  <Text style={styles.recentValue}>{entry.repCount} reps</Text>
                )}
                {entry.timeMs !== null && (
                  <Text style={styles.recentValue}>{formatTime(entry.timeMs)}</Text>
                )}
                <MaterialIcons name="check-circle" size={14} color="#cafd00" />
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Activity modal */}
      <ActivityModal
        entry={modalEntry}
        eventId={eventId}
        onConfirm={handleModalConfirm}
        onClose={() => setModalEntry(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0e0e0f' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0e0e0f' },
  noEventText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#adaaaa' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
    gap: 12,
  },
  brand: {
    fontFamily: 'Inter_900Black',
    fontSize: 18,
    color: '#cafd00',
    fontStyle: 'italic',
    letterSpacing: -0.5,
    marginRight: 'auto' as any,
  },
  headerMeta: { alignItems: 'flex-end', gap: 4 },
  eventName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#adaaaa',
    letterSpacing: 0.5,
    maxWidth: 180,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#cafd00',
    borderRadius: 2,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  chipText: {
    fontFamily: 'Inter_900Black',
    fontSize: 7,
    color: '#cafd00',
    letterSpacing: 2,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  sectionLabel: {
    fontFamily: 'Inter_900Black',
    fontSize: 9,
    color: '#adaaaa',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  milestoneScroll: { marginBottom: 24, marginHorizontal: -20 },
  milestoneScrollContent: { paddingHorizontal: 20, gap: 8 },
  milestonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#131313',
  },
  milestonePillActive: {
    borderColor: '#cafd00',
    backgroundColor: '#cafd00',
  },
  milestonePillOrder: {
    fontFamily: 'Inter_900Black',
    fontSize: 9,
    color: '#adaaaa',
    letterSpacing: 1,
  },
  milestonePillName: {
    fontFamily: 'Inter_900Black',
    fontSize: 10,
    color: '#fff',
    letterSpacing: 0.5,
  },
  milestonePillTextActive: { color: '#3a4a00' },

  boardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 10,
  },
  boardCount: {
    fontFamily: 'Inter_900Black',
    fontSize: 12,
    color: '#cafd00',
    letterSpacing: 1,
  },

  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
  },
  recentBib: {
    fontFamily: 'Inter_900Black',
    fontSize: 16,
    color: '#fff',
    letterSpacing: -0.5,
    width: 56,
  },
  recentMilestone: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#adaaaa',
    flex: 1,
    letterSpacing: 0.5,
  },
  recentValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#cafd00',
    letterSpacing: 0.5,
  },
});
