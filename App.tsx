import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { appBrand } from './src/config/appBrand';
import { useData, DataProvider } from './src/data/DataProvider';
import {
  EntitlementProvider,
  useEntitlement,
} from './src/entitlement/EntitlementProvider';
import { AppNavigator } from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { OnboardingModal } from './src/onboarding';
import { spacing } from './src/theme/spacing';
import { typography } from './src/theme/typography';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

function AppShell() {
  const theme = useTheme();
  const {
    ready,
    error,
    settings,
    repositories,
    reloadSettings,
    tutorialReplayToken,
  } = useData();
  const { ready: entitlementReady } = useEntitlement();
  const [onboardingVisible, setOnboardingVisible] = useState(false);

  useEffect(() => {
    if (!ready || !settings) {
      return;
    }
    if (!settings.tutorialSeen) {
      setOnboardingVisible(true);
    }
  }, [ready, settings?.tutorialSeen]);

  useEffect(() => {
    if (tutorialReplayToken > 0) {
      setOnboardingVisible(true);
    }
  }, [tutorialReplayToken]);

  const onOnboardingFinished = useCallback(async () => {
    setOnboardingVisible(false);
    if (!repositories) {
      return;
    }
    if (!settings?.tutorialSeen) {
      await repositories.settings.update({ tutorialSeen: true });
      await reloadSettings();
    }
  }, [repositories, settings?.tutorialSeen, reloadSettings]);

  if (error) {
    return (
      <View
        style={[
          styles.boot,
          { backgroundColor: theme.background, paddingHorizontal: spacing.lg },
        ]}
      >
        <Text style={[typography.title, { color: theme.textPrimary }]}>
          Couldn’t start {appBrand.appName}
        </Text>
        <Text
          style={[
            typography.body,
            { color: theme.textSecondary, marginTop: spacing.sm },
          ]}
        >
          {error}
        </Text>
        <StatusBar style={theme.statusBarStyle} />
      </View>
    );
  }

  if (!ready || !entitlementReady) {
    return (
      <View style={[styles.boot, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} />
        <StatusBar style={theme.statusBarStyle} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <AppNavigator />
      <OnboardingModal
        visible={onboardingVisible}
        onFinished={() => {
          void onOnboardingFinished();
        }}
      />
      <StatusBar style={theme.statusBarStyle} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

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
