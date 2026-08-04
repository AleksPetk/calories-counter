import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LibraryItemEditorScreen } from '../screens/library/LibraryItemEditorScreen';
import { ReferenceCopyScreen } from '../screens/library/ReferenceCopyScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { useTheme } from '../theme/ThemeProvider';
import { LibraryStackParamList } from './types';

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export function LibraryNavigator() {
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
        name="LibraryHome"
        component={LibraryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LibraryItemEditor"
        component={LibraryItemEditorScreen}
        options={{ title: 'Item' }}
      />
      <Stack.Screen
        name="ReferenceCopy"
        component={ReferenceCopyScreen}
        options={{ title: 'Copy to My Library' }}
      />
    </Stack.Navigator>
  );
}
