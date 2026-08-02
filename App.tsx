import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useData, DataProvider } from './src/data/DataProvider';
import {
  EntitlementProvider,
  useEntitlement,
} from './src/entitlement/EntitlementProvider';
import { AppNavigator } from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { TutorialProvider } from './src/tutorial/TutorialProvider';

function AppShell() {
  const theme = useTheme();
  const {
    ready,
    settings,
    repositories,
    reloadSettings,
    tutorialReplayToken,
  } = useData();
  const { ready: entitlementReady } = useEntitlement();
  const [tutorialVisible, setTutorialVisible] = useState(false);

  useEffect(() => {
    if (!ready || !settings) {
      return;
    }
    if (!settings.tutorialSeen) {
      setTutorialVisible(true);
    }
  }, [ready, settings?.tutorialSeen]);

  useEffect(() => {
    if (tutorialReplayToken > 0) {
      setTutorialVisible(true);
    }
  }, [tutorialReplayToken]);

  const onTutorialFinished = useCallback(async () => {
    setTutorialVisible(false);
    if (!repositories) {
      return;
    }
    if (!settings?.tutorialSeen) {
      await repositories.settings.update({ tutorialSeen: true });
      await reloadSettings();
    }
  }, [repositories, settings?.tutorialSeen, reloadSettings]);

  // Wait for DB + entitlement trial bootstrap before showing the shell.
  if (!ready || !entitlementReady) {
    return null;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <TutorialProvider
        visible={tutorialVisible}
        onFinished={() => {
          void onTutorialFinished();
        }}
      >
        <AppNavigator />
        <StatusBar style={theme.statusBarStyle} />
      </TutorialProvider>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <ThemeProvider>
          <EntitlementProvider>
            <AppShell />
          </EntitlementProvider>
        </ThemeProvider>
      </DataProvider>
    </SafeAreaProvider>
  );
}
