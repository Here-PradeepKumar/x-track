import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@x-track/firebase';

interface RepCountInputProps {
  eventId: string;
  milestoneId: string;
  bibNumber: string;
  repTarget: number | null;
  value: number;
  onChange: (value: number) => void;
}

export default function RepCountInput({
  eventId,
  milestoneId,
  bibNumber,
  repTarget,
  value,
  onChange,
}: RepCountInputProps) {
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLast = async () => {
      try {
        const id = `${eventId}_${milestoneId}_${bibNumber}`;
        const snap = await getDoc(doc(db, 'checkpoints', id));
        if (snap.exists()) {
          const saved = snap.data().repCount ?? null;
          setLastSaved(saved);
          if (saved !== null) onChange(saved);
        }
      } catch {
        // no prior entry
      } finally {
        setLoading(false);
      }
    };
    fetchLast();
  }, []);

  const atTarget = repTarget !== null && value >= repTarget;
  const progress = repTarget ? Math.min(value / repTarget, 1) : 0;

  return (
    <View style={styles.root}>
      {/* Last saved badge */}
      {loading ? (
        <ActivityIndicator size="small" color="#adaaaa" style={{ marginBottom: 12 }} />
      ) : lastSaved !== null ? (
        <View style={styles.lastBadge}>
          <Text style={styles.lastLabel}>LAST RECORDED</Text>
          <Text style={styles.lastValue}>{lastSaved}</Text>
        </View>
      ) : null}

      {/* Counter */}
      <View style={styles.counterRow}>
        <TouchableOpacity
          onPress={() => onChange(Math.max(0, value - 1))}
          style={styles.adjBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.adjBtnText}>−</Text>
        </TouchableOpacity>

        <View style={styles.countWrap}>
          <Text style={[styles.countText, atTarget && styles.countTextDone]}>{value}</Text>
          {repTarget !== null && (
            <Text style={styles.targetText}>/ {repTarget}</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => onChange(value + 1)}
          style={styles.adjBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.adjBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      {repTarget !== null && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` as any }, atTarget && styles.progressFillDone]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12 },
  lastBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignSelf: 'center',
  },
  lastLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    color: '#adaaaa',
    letterSpacing: 2,
  },
  lastValue: {
    fontFamily: 'Inter_900Black',
    fontSize: 14,
    color: '#cafd00',
    letterSpacing: -0.5,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  adjBtn: {
    width: 56,
    height: 56,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjBtnText: {
    fontFamily: 'Inter_900Black',
    fontSize: 28,
    color: '#fff',
    lineHeight: 32,
  },
  countWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    minWidth: 80,
    justifyContent: 'center',
  },
  countText: {
    fontFamily: 'Inter_900Black',
    fontSize: 52,
    color: '#fff',
    letterSpacing: -2,
    lineHeight: 56,
  },
  countTextDone: { color: '#cafd00' },
  targetText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#adaaaa',
    letterSpacing: 0.5,
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#1e1e1e',
    width: '100%',
  },
  progressFill: {
    height: 3,
    backgroundColor: '#555',
  },
  progressFillDone: { backgroundColor: '#cafd00' },
});
