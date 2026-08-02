import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppInformationScreen } from '../screens/settings/AppInformationScreen';
import { DailyGoalEditorScreen } from '../screens/settings/DailyGoalEditorScreen';
import { ProfileScreen } from '../screens/settings/ProfileScreen';
import { ResetTimeEditorScreen } from '../screens/settings/ResetTimeEditorScreen';
import { RetentionPickerScreen } from '../screens/settings/RetentionPickerScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useTheme } from '../theme/ThemeProvider';
import { SettingsStackParamList } from './types';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: theme.textPrimary,
        headerStyle: { backgroundColor: theme.background },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen
        name="SettingsHome"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="AppInformation"
        component={AppInformationScreen}
        options={{ title: 'App Information' }}
      />
      <Stack.Screen
        name="DailyGoalEditor"
        component={DailyGoalEditorScreen}
        options={{ title: 'Daily calorie goal' }}
      />
      <Stack.Screen
        name="ResetTimeEditor"
        component={ResetTimeEditorScreen}
        options={{ title: 'Day reset time' }}
      />
      <Stack.Screen
        name="RetentionPicker"
        component={RetentionPickerScreen}
        options={{ title: 'History retention' }}
      />
    </Stack.Navigator>
  );
}
