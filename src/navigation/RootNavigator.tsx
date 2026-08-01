import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { TAB_LABELS } from '../constants';
import { HistoryScreen } from '../screens/HistoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors } from '../theme/colors';
import { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      }}
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
