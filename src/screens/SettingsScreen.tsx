import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { SettingsRow } from '../components/SettingsRow';
import { ThemePicker } from '../components/ThemePicker';
import { appBrand } from '../config/appBrand';
import { DEFAULT_DAILY_GOAL, DEFAULT_RESET_TIME } from '../constants';
import { useData } from '../data/DataProvider';
import { resetAndReseedDevLibrary } from '../data/seed/seedDevData';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';

export function SettingsScreen() {
  const theme = useTheme();
  const { repositories, refresh, settings } = useData();
  const [reseeding, setReseeding] = useState(false);

  const goal = settings?.dailyGoal ?? DEFAULT_DAILY_GOAL;
  const resetTime = settings?.resetTime ?? DEFAULT_RESET_TIME;

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
        },
        group: {
          borderRadius: radii.xl,
          overflow: 'hidden',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          backgroundColor: theme.surface,
          ...theme.softShadow,
        },
      }),
    [theme],
  );

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

  return (
    <Screen>
      <Text style={styles.title}>Settings</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemePicker />

        <View style={styles.group}>
          <SettingsRow
            label="Daily calorie goal"
            value={`${Math.round(goal)} kcal`}
          />
          <SettingsRow label="Day reset time" value={resetTime} />
          <SettingsRow label="Replay tutorial" />
          <SettingsRow label="Purchase status" value="Trial" />
          <SettingsRow
            label="About"
            value={`${appBrand.appName} · v${appBrand.version}`}
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
      </ScrollView>
    </Screen>
  );
}
