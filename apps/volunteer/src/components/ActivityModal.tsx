import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BoardEntry } from './ActiveBoard';
import RepCountInput from './RepCountInput';
import TimerInput from './TimerInput';

interface ActivityValue {
  repCount?: number;
  timeMs?: number;
}

interface ActivityModalProps {
  entry: BoardEntry | null;   // null = closed
  eventId: string;
  onConfirm: (entry: BoardEntry, value: ActivityValue) => void;
  onClose: () => void;
}

export default function ActivityModal({ entry, eventId, onConfirm, onClose }: ActivityModalProps) {
  const [repCount, setRepCount] = useState(0);
  const [timeMs, setTimeMs] = useState(0);

  // Reset local state when entry changes (new modal open)
  const [lastEntryId, setLastEntryId] = useState<string | null>(null);
  if (entry && entry.id !== lastEntryId) {
    setLastEntryId(entry.id);
    setRepCount(0);
    setTimeMs(0);
  }

  if (!entry) return null;

  const isRun = entry.stationType === 'run';
  const isReps = entry.requiresRepCount;

  const handleConfirm = () => {
    const value: ActivityValue = {};
    if (isRun) value.timeMs = timeMs;
    else if (isReps) value.repCount = repCount;
    onConfirm(entry, value);
  };

  const confirmDisabled = isRun && timeMs === 0;

  return (
    <Modal
      visible={!!entry}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.bibNumber}>{entry.bibNumber}</Text>
              <View style={styles.stationPill}>
                <Text style={styles.stationPillText}>{entry.milestoneName.toUpperCase()}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <MaterialIcons name="close" size={20} color="#adaaaa" />
            </TouchableOpacity>
          </View>

          {/* Athlete meta */}
          <Text style={styles.meta}>
            {entry.wave} · {entry.category}
            {entry.athleteName ? ` · ${entry.athleteName}` : ''}
            {entry.categoryWeight != null ? ` · ${entry.categoryWeight} kg` : ''}
          </Text>

          <View style={styles.divider} />

          {/* Activity input area */}
          <ScrollView contentContainerStyle={styles.inputArea} showsVerticalScrollIndicator={false}>
            {isRun ? (
              <>
                <Text style={styles.inputLabel}>RECORD TIME</Text>
                <TimerInput onChange={setTimeMs} />
              </>
            ) : isReps ? (
              <>
                <Text style={styles.inputLabel}>REP COUNT</Text>
                <RepCountInput
                  eventId={eventId}
                  milestoneId={entry.milestoneId}
                  bibNumber={entry.bibNumber}
                  repTarget={entry.repTarget}
                  value={repCount}
                  onChange={setRepCount}
                />
              </>
            ) : (
              <Text style={styles.simpleNote}>
                Tap CONFIRM to log this athlete at {entry.milestoneName}.
              </Text>
            )}
          </ScrollView>

          {/* Confirm button */}
          <TouchableOpacity
            onPress={handleConfirm}
            style={[styles.confirmBtn, confirmDisabled && styles.confirmBtnDisabled]}
            activeOpacity={0.85}
            disabled={confirmDisabled}
          >
            <Text style={styles.confirmBtnText}>CONFIRM</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0e0e0f',
    borderTopWidth: 1,
    borderTopColor: '#1e1e1e',
    paddingHorizontal: 24,
    paddingBottom: 36,
    maxHeight: '90%',
  },
  handle: {
    width: 36,
    height: 3,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bibNumber: {
    fontFamily: 'Inter_900Black',
    fontSize: 36,
    color: '#fff',
    letterSpacing: -1.5,
  },
  stationPill: {
    borderWidth: 1,
    borderColor: '#cafd00',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stationPillText: {
    fontFamily: 'Inter_900Black',
    fontSize: 8,
    color: '#cafd00',
    letterSpacing: 2,
  },
  meta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#adaaaa',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#1e1e1e',
    marginBottom: 20,
  },
  inputArea: {
    paddingBottom: 24,
    gap: 16,
  },
  inputLabel: {
    fontFamily: 'Inter_900Black',
    fontSize: 9,
    color: '#adaaaa',
    letterSpacing: 3,
    marginBottom: 4,
  },
  simpleNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#adaaaa',
    letterSpacing: 0.3,
    textAlign: 'center',
    paddingVertical: 32,
  },
  confirmBtn: {
    backgroundColor: '#cafd00',
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmBtnDisabled: {
    backgroundColor: '#1e1e1e',
  },
  confirmBtnText: {
    fontFamily: 'Inter_900Black',
    fontSize: 14,
    color: '#3a4a00',
    letterSpacing: 3,
  },
});
