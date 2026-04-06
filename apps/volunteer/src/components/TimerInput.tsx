import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface TimerInputProps {
  /** Called whenever the time changes, with ms value */
  onChange: (timeMs: number) => void;
}

export default function TimerInput({ onChange }: TimerInputProps) {
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      startRef.current = Date.now() - elapsedMs;
      rafRef.current = setInterval(() => {
        const ms = Date.now() - startRef.current!;
        setElapsedMs(ms);
        onChange(ms);
      }, 100);
    } else {
      if (rafRef.current) clearInterval(rafRef.current);
    }
    return () => { if (rafRef.current) clearInterval(rafRef.current); };
  }, [running]);

  const reset = () => {
    setRunning(false);
    setElapsedMs(0);
    onChange(0);
  };

  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centis = Math.floor((elapsedMs % 1000) / 10);

  const pad = (n: number, digits = 2) => String(n).padStart(digits, '0');

  return (
    <View style={styles.root}>
      {/* Display */}
      <View style={styles.displayRow}>
        <Text style={[styles.timeText, running && styles.timeTextActive]}>
          {pad(minutes)}:{pad(seconds)}
          <Text style={styles.centisText}>.{pad(centis)}</Text>
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={() => setRunning((r) => !r)}
          style={[styles.ctrlBtn, running && styles.ctrlBtnActive]}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name={running ? 'pause' : 'play-arrow'}
            size={28}
            color={running ? '#3a4a00' : '#cafd00'}
          />
          <Text style={[styles.ctrlLabel, running && styles.ctrlLabelActive]}>
            {running ? 'PAUSE' : elapsedMs > 0 ? 'RESUME' : 'START'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={reset} style={styles.resetBtn} activeOpacity={0.7}>
          <MaterialIcons name="refresh" size={20} color="#adaaaa" />
          <Text style={styles.resetLabel}>RESET</Text>
        </TouchableOpacity>
      </View>

      {elapsedMs > 0 && !running && (
        <Text style={styles.hint}>Time captured — tap CONFIRM to save</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 20, alignItems: 'center' },
  displayRow: {
    paddingVertical: 8,
  },
  timeText: {
    fontFamily: 'Inter_900Black',
    fontSize: 64,
    color: '#333',
    letterSpacing: -3,
    lineHeight: 70,
  },
  timeTextActive: { color: '#fff' },
  centisText: {
    fontSize: 32,
    color: '#adaaaa',
    letterSpacing: -1,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  ctrlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#cafd00',
    backgroundColor: 'transparent',
  },
  ctrlBtnActive: {
    backgroundColor: '#cafd00',
  },
  ctrlLabel: {
    fontFamily: 'Inter_900Black',
    fontSize: 12,
    color: '#cafd00',
    letterSpacing: 2,
  },
  ctrlLabelActive: { color: '#3a4a00' },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  resetLabel: {
    fontFamily: 'Inter_900Black',
    fontSize: 11,
    color: '#adaaaa',
    letterSpacing: 2,
  },
  hint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#cafd00',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
});
