import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { SettingsRow } from '../components/SettingsRow';
import { appBrand } from '../config/appBrand';
import {
  DEFAULT_DAILY_GOAL,
  DEFAULT_RESET_TIME,
} from '../constants';
import { useData } from '../data/DataProvider';
import { eraseAllData } from '../data/erase/eraseAllData';
import { labelForRetentionDays } from '../data/history/historyRetention';
import { resetAndReseedDevLibrary } from '../data/seed/seedDevData';
import { useEntitlement } from '../entitlement';
import { formatRemainingTrial } from '../entitlement/formatRemaining';
import { SettingsStackParamList } from '../navigation/types';
import { DevEntitlementPanel } from './settings/DevEntitlementPanel';
import { DEFAULT_THEME_ID, resolveTheme } from '../theme/registry';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme, useThemeControls } from '../theme/ThemeProvider';

function entitlementStatusLabel(
  accessState: string | null | undefined,
  isSimulated: boolean | undefined,
  remainingMs: number | null | undefined,
): string {
  if (accessState === 'purchased') {
    return isSimulated ? 'Purchased (simulated)' : 'Purchased';
  }
  if (accessState === 'trial_expired') {
    return 'Trial ended';
  }
  if (accessState === 'trial_active') {
    return formatRemainingTrial(remainingMs ?? null);
  }
  return '…';
}

export function SettingsScreen() {
  const theme = useTheme();
  const { themeId, setThemeId } = useThemeControls();
  const navigation =
    useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const currentThemeName = resolveTheme(themeId).name;
  const {
    repositories,
    refresh,
    settings,
    reloadSettings,
    requestTutorialReplay,
  } = useData();
  const {
    snapshot,
    openPaywall,
    restore,
    refreshLocal,
  } = useEntitlement();
  const [reseeding, setReseeding] = useState(false);

  const goal = settings?.dailyGoal ?? DEFAULT_DAILY_GOAL;
  const resetTime = settings?.resetTime ?? DEFAULT_RESET_TIME;
  const retentionLabel = labelForRetentionDays(
    settings?.historyRetention ?? null,
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        title: {
          ...typography.title,
          color: theme.textPrimary,
          marginBottom: spacing.lg,
        },
        scrollContent: {
          paddingBottom: spacing.xxl,
          gap: spacing.lg,
        },
        group: {
          borderRadius: radii.xl,
          overflow: 'hidden',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          backgroundColor: theme.surface,
          ...theme.softShadow,
        },
        sectionLabel: {
          ...typography.caption,
          color: theme.textSecondary,
          marginBottom: spacing.sm,
          marginLeft: spacing.xs,
        },
      }),
    [theme],
  );

  const confirmClearHistory = () => {
    if (!repositories) {
      return;
    }
    Alert.alert(
      'Clear History?',
      'Deletes all log entries. Library, settings, theme, and tutorial state are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear History',
          style: 'destructive',
          onPress: async () => {
            await repositories.dailyLogEntries.deleteAll();
            refresh();
          },
        },
      ],
    );
  };

  const confirmEraseAllData = () => {
    if (!repositories) {
      return;
    }
    Alert.alert(
      'Erase All Data?',
      'This permanently deletes your library, history, and local settings. Trial clock and purchase entitlement are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you sure?',
              'This cannot be undone. Defaults will be restored. Trial and store purchase stay as-is.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Erase Everything',
                  style: 'destructive',
                  onPress: async () => {
                    await eraseAllData(repositories);
                    await reloadSettings();
                    await refreshLocal();
                    await setThemeId(resolveTheme(DEFAULT_THEME_ID).id);
                    refresh();
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const confirmResetAndReseed = () => {
    if (!__DEV__ || !repositories || reseeding) {
      return;
    }

    Alert.alert(
      'Reset & reseed library?',
      'Deletes all library items, then inserts the development seed catalog. Logging data is not cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset & reseed',
          style: 'destructive',
          onPress: async () => {
            setReseeding(true);
            try {
              await resetAndReseedDevLibrary(repositories);
              refresh();
              Alert.alert('Done', 'Library was reset and reseeded.');
            } catch (error) {
              Alert.alert(
                'Reseed failed',
                error instanceof Error ? error.message : String(error),
              );
            } finally {
              setReseeding(false);
            }
          },
        },
      ],
    );
  };

  const onRestore = async () => {
    const result = await restore();
    if (result === 'restored') {
      Alert.alert('Restored', 'Lifetime purchase restored on this device.');
      return;
    }
    if (result === 'unavailable') {
      Alert.alert(
        'Store unavailable',
        'In-app purchases need a development or store build. Expo Go cannot load store price, purchase, or restore.',
      );
      return;
    }
    if (result === 'none') {
      Alert.alert(
        'Nothing to restore',
        'No lifetime purchase found for this store account on this platform.',
      );
      return;
    }
    Alert.alert(
      'Restore failed',
      'Could not restore purchases. Please try again.',
    );
  };

  return (
    <Screen>
      <Text style={styles.title}>Settings</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View>
          <Text style={styles.sectionLabel}>Appearance</Text>
          <View style={styles.group}>
            <SettingsRow
              label="Themes"
              value={currentThemeName}
              onPress={() => navigation.navigate('Themes')}
              isLast
            />
          </View>
        </View>

        <View>
          <Text style={styles.sectionLabel}>Goals & day</Text>
          <View style={styles.group}>
            <SettingsRow
              label="Daily calorie goal"
              value={`${Math.round(goal)} kcal`}
              onPress={() => navigation.navigate('DailyGoalEditor')}
            />
            <SettingsRow
              label="Day reset time"
              value={resetTime}
              onPress={() => navigation.navigate('ResetTimeEditor')}
            />
            <SettingsRow
              label="History retention"
              value={retentionLabel}
              onPress={() => navigation.navigate('RetentionPicker')}
              isLast
            />
          </View>
        </View>

        <View>
          <Text style={styles.sectionLabel}>Purchase</Text>
          <View style={styles.group}>
            <SettingsRow
              label="Status"
              value={entitlementStatusLabel(
                snapshot?.accessState,
                snapshot?.isSimulatedPurchase,
                snapshot?.remainingMs,
              )}
              onPress={openPaywall}
            />
            <SettingsRow
              label="Unlock Lifetime"
              onPress={openPaywall}
            />
            <SettingsRow
              label="Restore Purchase"
              onPress={() => {
                void onRestore();
              }}
              isLast
            />
          </View>
        </View>

        <View>
          <Text style={styles.sectionLabel}>Help</Text>
          <View style={styles.group}>
            <SettingsRow
              label="Replay tutorial"
              onPress={requestTutorialReplay}
            />
            <SettingsRow
              label="App Information"
              value={`${appBrand.appName} · v${appBrand.version}`}
              onPress={() => navigation.navigate('AppInformation')}
              isLast
            />
          </View>
        </View>

        <View>
          <Text style={styles.sectionLabel}>Data</Text>
          <View style={styles.group}>
            <SettingsRow label="Clear History" onPress={confirmClearHistory} />
            <SettingsRow
              label="Erase All Data"
              onPress={confirmEraseAllData}
              isLast={!__DEV__}
            />
            {__DEV__ ? (
              <SettingsRow
                label={reseeding ? 'Reseeding…' : 'Dev: reset & reseed library'}
                value="DEV"
                onPress={confirmResetAndReseed}
                isLast
              />
            ) : null}
          </View>
        </View>

        {__DEV__ ? <DevEntitlementPanel /> : null}
      </ScrollView>
    </Screen>
  );
}
