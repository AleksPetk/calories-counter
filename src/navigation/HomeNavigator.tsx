import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/HomeScreen';
import { LogEntryEditorScreen } from '../screens/LogEntryEditorScreen';
import { TodaysLogScreen } from '../screens/TodaysLogScreen';
import { useTheme } from '../theme/ThemeProvider';
import { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeNavigator() {
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
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TodaysLog"
        component={TodaysLogScreen}
        options={{ title: "Today's Log" }}
      />
      <Stack.Screen
        name="LogEntryEditor"
        component={LogEntryEditorScreen}
        options={{ title: 'Edit entry' }}
      />
    </Stack.Navigator>
  );
}
