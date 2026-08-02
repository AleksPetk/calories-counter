import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HistoryScreen } from '../screens/HistoryScreen';
import { LogEntryEditorScreen } from '../screens/LogEntryEditorScreen';
import { useTheme } from '../theme/ThemeProvider';
import { HistoryStackParamList } from './types';

const Stack = createNativeStackNavigator<HistoryStackParamList>();

export function HistoryNavigator() {
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
        name="HistoryHome"
        component={HistoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LogEntryEditor"
        component={LogEntryEditorScreen}
        options={{ title: 'Edit entry' }}
      />
    </Stack.Navigator>
  );
}
