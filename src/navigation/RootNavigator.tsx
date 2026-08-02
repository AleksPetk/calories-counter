import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet } from 'react-native';

import { TAB_LABELS } from '../constants';
import { useTheme } from '../theme/ThemeProvider';
import { HistoryNavigator } from './HistoryNavigator';
import { HomeNavigator } from './HomeNavigator';
import { LibraryNavigator } from './LibraryNavigator';
import { SettingsNavigator } from './SettingsNavigator';
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
  const theme = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.tabActive,
        tabBarInactiveTintColor: theme.tabInactive,
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
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 6,
          ...Platform.select({
            ios: {
              shadowColor: theme.textPrimary,
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
        component={HomeNavigator}
        options={{ title: TAB_LABELS.home }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryNavigator}
        options={{ title: TAB_LABELS.library }}
      />
      <Tab.Screen
        name="History"
        component={HistoryNavigator}
        options={{ title: TAB_LABELS.history }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{ title: TAB_LABELS.settings }}
      />
    </Tab.Navigator>
  );
}
