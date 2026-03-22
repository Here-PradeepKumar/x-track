import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';

interface TopBarProps {
  rightBadge?: string;
  avatarUri?: string;
}

export function TopBar({ rightBadge, avatarUri }: TopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.brand}>
        <MaterialIcons name="leaderboard" size={24} color={Colors.electricOrange} />
        <Text style={styles.brandText}>X-TRACK</Text>
      </View>
      <View style={styles.right}>
        {rightBadge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{rightBadge}</Text>
          </View>
        )}
        <View style={styles.avatar}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <MaterialIcons name="person" size={20} color={Colors.onSurfaceVariant} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontFamily: 'Inter_900Black',
    fontSize: 22,
    color: Colors.electricOrange,
    letterSpacing: -1,
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    borderWidth: 1,
    borderColor: Colors.electricOrange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  badgeText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: Colors.electricOrange,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});
