import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import {
  FormKeyboardScroll,
  FormTextInput,
} from '../../components/FormKeyboardScroll';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { DEFAULT_RESET_TIME } from '../../constants';
import { useData } from '../../data/DataProvider';
import { radii } from '../../theme/radii';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeProvider';

function normalizeResetTimeInput(value: string): string | null {
  const trimmed = value.trim();
  const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function ResetTimeEditorScreen({
  navigation,
}: {
  navigation: { goBack: () => void };
}) {
  const theme = useTheme();
  const { repositories, settings, reloadSettings, refresh } = useData();
  const [resetTime, setResetTime] = useState(
    settings?.resetTime ?? DEFAULT_RESET_TIME,
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setResetTime(settings?.resetTime ?? DEFAULT_RESET_TIME);
  }, [settings?.resetTime]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        label: {
          ...typography.caption,
          color: theme.textSecondary,
          marginBottom: spacing.xs,
        },
        input: {
          minHeight: 52,
          borderRadius: radii.md,
          backgroundColor: theme.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          paddingHorizontal: spacing.md,
          ...typography.body,
          color: theme.textPrimary,
        },
        hint: {
          ...typography.caption,
          color: theme.textMuted,
          marginTop: spacing.sm,
        },
        save: { marginTop: spacing.xl },
      }),
    [theme],
  );

  const onSave = async () => {
    if (!repositories) {
      return;
    }
    const normalized = normalizeResetTimeInput(resetTime);
    if (!normalized) {
      Alert.alert('Invalid time', 'Use 24-hour format HH:mm (e.g. 00:00 or 04:00).');
      return;
    }
    setSaving(true);
    try {
      await repositories.settings.update({ resetTime: normalized });
      await reloadSettings();
      refresh();
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
      <FormKeyboardScroll>
        <Text style={styles.label}>Day reset time (HH:mm)</Text>
        <FormTextInput
          value={resetTime}
          onChangeText={setResetTime}
          style={styles.input}
          placeholder="00:00"
          placeholderTextColor={theme.placeholder}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.hint}>
          Before this local time, logs still count toward the previous day.
        </Text>
        <PrimaryButton
          label={saving ? 'Saving…' : 'Save'}
          onPress={onSave}
          style={styles.save}
        />
      </FormKeyboardScroll>
    </Screen>
  );
}
