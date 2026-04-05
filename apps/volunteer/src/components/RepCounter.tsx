import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface RepCounterProps {
  count: number;
  target: number | null;
  onIncrement: () => void;
  onDecrement: () => void;
}

export default function RepCounter({ count, target, onIncrement, onDecrement }: RepCounterProps) {
  const progress = target && target > 0 ? Math.min(count / target, 1) : 0;
  const isComplete = target !== null && count >= target;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={onDecrement}
          disabled={count === 0}
          activeOpacity={0.7}
          style={[styles.btn, styles.btnMinus, count === 0 && styles.btnDisabled]}
        >
          <Text style={[styles.btnText, count === 0 && styles.btnTextDisabled]}>−</Text>
        </TouchableOpacity>

        <View style={styles.countContainer}>
          <Text style={[styles.countText, isComplete && styles.countComplete]}>{count}</Text>
          {target !== null && (
            <Text style={styles.targetText}>/ {target}</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={onIncrement}
          activeOpacity={0.7}
          style={[styles.btn, styles.btnPlus, isComplete && styles.btnComplete]}
        >
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>

      {target !== null && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  btn: {
    width: 60,
    height: 60,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnMinus: { backgroundColor: 'rgba(255,115,81,0.15)', borderWidth: 1, borderColor: '#ff7351' },
  btnPlus: { backgroundColor: 'rgba(202,253,0,0.15)', borderWidth: 1, borderColor: '#cafd00' },
  btnComplete: { backgroundColor: 'rgba(202,253,0,0.3)' },
  btnDisabled: { backgroundColor: '#1a1a1a', borderColor: '#333' },
  btnText: { fontFamily: 'Inter_900Black', fontSize: 28, color: '#fff' },
  btnTextDisabled: { color: '#494847' },
  countContainer: { alignItems: 'center' },
  countText: { fontFamily: 'Inter_900Black', fontSize: 48, color: '#fff', letterSpacing: -2 },
  countComplete: { color: '#cafd00' },
  targetText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#adaaaa', letterSpacing: 1, marginTop: -4 },
  progressTrack: {
    height: 4,
    backgroundColor: '#1e1e1e',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#cafd00',
    borderRadius: 2,
  },
});
