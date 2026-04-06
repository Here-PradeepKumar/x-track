import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';

export type BoardEntryStatus = 'pending' | 'confirming' | 'done' | 'error';

export interface BoardEntry {
  id: string;
  bibNumber: string;
  athleteUid: string;
  athleteName: string;
  wave: string;
  category: string;
  categoryWeight: number | null;
  milestoneId: string;
  milestoneName: string;
  stationType: string;
  requiresRepCount: boolean;
  repTarget: number | null;
  status: BoardEntryStatus;
}

interface ActiveBoardProps {
  entries: BoardEntry[];
  onLogResult: (entry: BoardEntry) => void;
  onRemove: (id: string) => void;
}

export default function ActiveBoard({ entries, onLogResult, onRemove }: ActiveBoardProps) {
  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No athletes on board. Enter a BIB number above.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
      {entries.map((entry) => (
        <View
          key={entry.id}
          style={[
            styles.card,
            entry.status === 'done' && styles.cardDone,
            entry.status === 'error' && styles.cardError,
          ]}
        >
          {/* Card header */}
          <View style={styles.cardHeader}>
            <Text style={styles.bibText}>{entry.bibNumber}</Text>
            <View style={styles.milestonePill}>
              <Text style={styles.milestonePillText}>{entry.milestoneName.toUpperCase()}</Text>
            </View>
            {entry.status !== 'confirming' && entry.status !== 'done' && (
              <TouchableOpacity
                onPress={() => onRemove(entry.id)}
                style={styles.removeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Meta */}
          <Text style={styles.metaText}>
            {entry.wave} · {entry.category}
            {entry.athleteName ? ` · ${entry.athleteName}` : ''}
            {entry.categoryWeight != null ? ` · ${entry.categoryWeight} kg` : ''}
          </Text>

          {/* Status */}
          {entry.status === 'done' && (
            <View style={styles.doneRow}>
              <Text style={styles.doneText}>✓ CONFIRMED</Text>
            </View>
          )}
          {entry.status === 'error' && (
            <View style={styles.errorRow}>
              <Text style={styles.errorText}>FAILED — tap to retry</Text>
            </View>
          )}
          {(entry.status === 'pending' || entry.status === 'error') && (
            <TouchableOpacity
              onPress={() => onLogResult(entry)}
              activeOpacity={0.8}
              style={styles.logBtn}
            >
              <Text style={styles.logBtnText}>LOG RESULT</Text>
            </TouchableOpacity>
          )}
          {entry.status === 'confirming' && (
            <View style={styles.confirmingRow}>
              <ActivityIndicator color="#cafd00" size="small" />
              <Text style={styles.confirmingText}>Saving…</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  empty: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#494847',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#131313',
    borderRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#cafd00',
    padding: 16,
    marginBottom: 10,
  },
  cardDone: { borderLeftColor: '#00eefc', opacity: 0.7 },
  cardError: { borderLeftColor: '#ff7351' },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 10,
  },
  bibText: {
    fontFamily: 'Inter_900Black',
    fontSize: 28,
    color: '#fff',
    letterSpacing: -1,
    marginRight: 'auto' as any,
  },
  milestonePill: {
    borderWidth: 1,
    borderColor: '#cafd00',
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  milestonePillText: {
    fontFamily: 'Inter_900Black',
    fontSize: 8,
    color: '#cafd00',
    letterSpacing: 2,
  },
  removeBtn: { padding: 4 },
  removeBtnText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#494847',
  },
  metaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#adaaaa',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  logBtn: {
    borderWidth: 1,
    borderColor: '#cafd00',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  logBtnText: {
    fontFamily: 'Inter_900Black',
    fontSize: 13,
    color: '#cafd00',
    letterSpacing: 2,
  },
  confirmingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  confirmingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#cafd00',
    letterSpacing: 1,
  },
  doneRow: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneText: {
    fontFamily: 'Inter_900Black',
    fontSize: 13,
    color: '#00eefc',
    letterSpacing: 2,
  },
  errorRow: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#ff7351',
    letterSpacing: 0.5,
  },
});
