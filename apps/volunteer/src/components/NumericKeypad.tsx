import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface NumericKeypadProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  submitDisabled: boolean;
  error: string | null;
}

const MAX_LENGTH = 5;

export default function NumericKeypad({
  value,
  onChange,
  onSubmit,
  submitLabel,
  submitDisabled,
  error,
}: NumericKeypadProps) {
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (errorTimer.current) clearTimeout(errorTimer.current);
    };
  }, []);

  const handleKey = (key: string) => {
    if (key === '⌫') {
      onChange(value.slice(0, -1));
    } else if (value.length < MAX_LENGTH) {
      onChange(value + key);
    }
  };

  const keys = ['1','2','3','4','5','6','7','8','9','⌫','0','✓'];

  return (
    <View style={styles.container}>
      {/* Display */}
      <View style={[styles.display, error ? styles.displayError : null]}>
        <Text style={[styles.displayText, error ? styles.displayTextError : null]}>
          {error ?? (value || '—')}
        </Text>
      </View>

      {/* Key grid */}
      <View style={styles.grid}>
        {keys.map((k) => {
          const isSubmit = k === '✓';
          const isBackspace = k === '⌫';
          return (
            <TouchableOpacity
              key={k}
              onPress={() => (isSubmit ? onSubmit() : handleKey(k))}
              disabled={isSubmit ? submitDisabled : false}
              activeOpacity={0.7}
              style={[
                styles.key,
                isSubmit && styles.keySubmit,
                isSubmit && submitDisabled && styles.keyDisabled,
                isBackspace && styles.keyBackspace,
              ]}
            >
              <Text style={[
                styles.keyText,
                isSubmit && styles.keyTextSubmit,
                isSubmit && submitDisabled && styles.keyTextDisabled,
              ]}>
                {isSubmit ? submitLabel : k}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  display: {
    backgroundColor: '#131313',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#494847',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  displayError: { borderColor: '#ff7351', backgroundColor: 'rgba(255,115,81,0.1)' },
  displayText: {
    fontFamily: 'Inter_900Black',
    fontSize: 40,
    color: '#fff',
    letterSpacing: -1,
  },
  displayTextError: { color: '#ff7351', fontSize: 14, letterSpacing: 0.5 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  key: {
    width: '33.33%',
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#1e1e1e',
    backgroundColor: '#0e0e0f',
  },
  keySubmit: {
    backgroundColor: '#cafd00',
  },
  keyDisabled: {
    backgroundColor: '#1a1a1a',
  },
  keyBackspace: {
    backgroundColor: '#131313',
  },
  keyText: {
    fontFamily: 'Inter_900Black',
    fontSize: 22,
    color: '#fff',
  },
  keyTextSubmit: {
    color: '#3a4a00',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  keyTextDisabled: {
    color: '#494847',
  },
});
