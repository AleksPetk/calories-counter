import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../components/Screen';
import { HISTORY_RETENTION_OPTIONS } from '../../constants';
import { useData } from '../../data/DataProvider';
import { applyHistoryRetention } from '../../data/history/historyRetention';
import { radii } from '../../theme/radii';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeProvider';

export function RetentionPickerScreen({
  navigation,
}: {
  navigation: { goBack: () => void };
}) {
  const theme = useTheme();
  const { repositories, settings, reloadSettings, refresh } = useData();
  const [saving, setSaving] = useState(false);
  const current = settings?.historyRetention ?? null;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        hint: {
          ...typography.caption,
          color: theme.textSecondary,
          marginBottom: spacing.lg,
        },
        group: {
          borderRadius: radii.xl,
          overflow: 'hidden',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          backgroundColor: theme.surface,
          ...theme.softShadow,
        },
        row: {
          minHeight: 56,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.border,
        },
        rowLast: {
          borderBottomWidth: 0,
        },
        label: {
          ...typography.body,
          color: theme.textPrimary,
        },
        selected: {
          ...typography.caption,
          fontWeight: '700',
          color: theme.primary,
        },
      }),
    [theme],
  );

  const onSelect = async (days: number | null) => {
    if (!repositories || saving) {
      return;
    }
    setSaving(true);
    try {
      const previous = settings?.historyRetention ?? null;
      const next = await repositories.settings.update({
        historyRetention: days,
      });
      await reloadSettings();
      const shortened =
        days != null && (previous == null || days < previous);
      if (shortened) {
        await applyHistoryRetention(repositories, next);
        refresh();
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Save failed',
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.hint}>
        Older log entries are removed automatically. Library and
        settings are never deleted by retention.
      </Text>
      <View style={styles.group}>
        {HISTORY_RETENTION_OPTIONS.map((option, index) => {
          const selected = current === option.days;
          const isLast = index === HISTORY_RETENTION_OPTIONS.length - 1;
          return (
            <Pressable
              key={option.label}
              style={[styles.row, isLast && styles.rowLast]}
              onPress={() => onSelect(option.days)}
              disabled={saving}
            >
              <Text style={styles.label}>{option.label}</Text>
              {selected ? <Text style={styles.selected}>Selected</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
