import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NFCScanScreen } from '../screens/NFCScanScreen';
import { VolunteerProfileScreen } from '../screens/VolunteerProfileScreen';
import { Colors } from '@x-track/ui';

const Tab = createBottomTabNavigator();

type TabIconName = 'contactless' | 'person';

function TabBar({
  state,
  navigation,
}: {
  state: any;
  descriptors: any;
  navigation: any;
}) {
  const insets = useSafeAreaInsets();
  const tabs: { label: string; icon: TabIconName }[] = [
    { label: 'SCAN', icon: 'contactless' },
    { label: 'PROFILE', icon: 'person' },
  ];

  return (
    <View
      style={[
        styles.tabBar,
        {
          paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
          height: 64 + (insets.bottom > 0 ? insets.bottom : 12),
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const tab = tabs[index];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <View
            key={route.key}
            style={[styles.tabItem, isFocused && styles.tabItemActive]}
          >
            <MaterialIcons
              name={tab.icon}
              size={24}
              color={isFocused ? Colors.electricOrange : Colors.onSurfaceVariant}
              onPress={onPress}
            />
            <Text
              style={[styles.tabLabel, isFocused && styles.tabLabelActive]}
              onPress={onPress}
            >
              {tab.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function VolunteerNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Scan" component={NFCScanScreen} />
      <Tab.Screen name="Profile" component={VolunteerProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(14, 14, 15, 0.95)',
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
    paddingTop: 8,
    shadowColor: Colors.electricOrange,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 2,
    gap: 3,
  },
  tabItemActive: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
  tabLabel: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    color: Colors.electricOrange,
  },
});
