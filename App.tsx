import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DataProvider } from './src/data/DataProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

function AppShell() {
  const theme = useTheme();
  return (
    <NavigationContainer>
      <RootNavigator />
      <StatusBar style={theme.statusBarStyle} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <ThemeProvider>
          <AppShell />
        </ThemeProvider>
      </DataProvider>
    </SafeAreaProvider>
  );
}
