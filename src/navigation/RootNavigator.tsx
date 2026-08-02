import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet } from 'react-native';

import { TAB_LABELS } from '../constants';
import { HistoryScreen } from '../screens/HistoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors } from '../theme/colors';
import { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_ICONS: Record<
  keyof RootTabParamList,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Library: { active: 'nutrition', inactive: 'nutrition-outline' },
  History: { active: 'calendar', inactive: 'calendar-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

export function RootNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 2 : 6,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const icons = TAB_ICONS[route.name];
          return (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={size}
              color={color}
            />
          );
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderSubtle,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 6,
          ...Platform.select({
            ios: {
              shadowColor: '#0B1410',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.05,
              shadowRadius: 12,
            },
            android: {
              elevation: 8,
            },
          }),
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: TAB_LABELS.home }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{ title: TAB_LABELS.library }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: TAB_LABELS.history }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: TAB_LABELS.settings }}
      />
    </Tab.Navigator>
  );
}
