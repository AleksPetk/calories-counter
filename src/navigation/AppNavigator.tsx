import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { appBrand } from '../config/appBrand';
import { PaywallScreen } from '../screens/paywall/PaywallScreen';
import { useTheme } from '../theme/ThemeProvider';
import { RootNavigator } from './RootNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={RootNavigator} />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          title: `${appBrand.appName} Lifetime`,
          headerTintColor: theme.textPrimary,
          headerStyle: { backgroundColor: theme.background },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      />
    </Stack.Navigator>
  );
}
