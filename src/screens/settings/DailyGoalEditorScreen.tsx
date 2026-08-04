import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import {
  FormKeyboardScroll,
  FormTextInput,
} from '../../components/FormKeyboardScroll';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { DEFAULT_DAILY_GOAL } from '../../constants';
import { useData } from '../../data/DataProvider';
import { parsePositiveCalories } from '../../data/logging/logMath';
import { radii } from '../../theme/radii';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeProvider';

function parseOptionalNonNegativeGrams(raw: string): number | null | undefined {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  const value = Number.parseFloat(trimmed);
  if (!Number.isFinite(value) || value < 0) {
    return undefined;
  }
  return value;
}

export function DailyGoalEditorScreen({
  navigation,
}: {
  navigation: { goBack: () => void };
}) {
  const theme = useTheme();
  const { repositories, settings, reloadSettings, refresh } = useData();
  const [goal, setGoal] = useState(
    String(Math.round(settings?.dailyGoal ?? DEFAULT_DAILY_GOAL)),
  );
  const [protein, setProtein] = useState(
    settings?.proteinGoal == null ? '' : String(Math.round(settings.proteinGoal)),
  );
  const [carbs, setCarbs] = useState(
    settings?.carbsGoal == null ? '' : String(Math.round(settings.carbsGoal)),
  );
  const [fat, setFat] = useState(
    settings?.fatGoal == null ? '' : String(Math.round(settings.fatGoal)),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setGoal(String(Math.round(settings?.dailyGoal ?? DEFAULT_DAILY_GOAL)));
    setProtein(
      settings?.proteinGoal == null
        ? ''
        : String(Math.round(settings.proteinGoal)),
    );
    setCarbs(
      settings?.carbsGoal == null ? '' : String(Math.round(settings.carbsGoal)),
    );
    setFat(
      settings?.fatGoal == null ? '' : String(Math.round(settings.fatGoal)),
    );
  }, [
    settings?.dailyGoal,
    settings?.proteinGoal,
    settings?.carbsGoal,
    settings?.fatGoal,
  ]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        label: {
          ...typography.caption,
          color: theme.textSecondary,
          marginBottom: spacing.xs,
          marginTop: spacing.md,
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
    const value = parsePositiveCalories(goal);
    if (value == null) {
      Alert.alert('Invalid goal', 'Enter a calorie goal greater than zero.');
      return;
    }
    const proteinGoal = parseOptionalNonNegativeGrams(protein);
    const carbsGoal = parseOptionalNonNegativeGrams(carbs);
    const fatGoal = parseOptionalNonNegativeGrams(fat);
    if (
      proteinGoal === undefined ||
      carbsGoal === undefined ||
      fatGoal === undefined
    ) {
      Alert.alert(
        'Invalid macros',
        'Macro goals must be empty or zero-or-greater numbers (grams).',
      );
      return;
    }
    setSaving(true);
    try {
      await repositories.settings.update({
        dailyGoal: value,
        proteinGoal,
        carbsGoal,
        fatGoal,
      });
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
        <Text style={[styles.label, { marginTop: 0 }]}>Daily calorie goal</Text>
        <FormTextInput
          value={goal}
          onChangeText={setGoal}
          keyboardType="numeric"
          style={styles.input}
          placeholderTextColor={theme.placeholder}
        />
        <Text style={styles.hint}>
          Used by the Home remaining-calories card.
        </Text>

        <Text style={styles.label}>Protein goal (g, optional)</Text>
        <FormTextInput
          value={protein}
          onChangeText={setProtein}
          keyboardType="decimal-pad"
          style={styles.input}
          placeholderTextColor={theme.placeholder}
        />
        <Text style={styles.label}>Carbs goal (g, optional)</Text>
        <FormTextInput
          value={carbs}
          onChangeText={setCarbs}
          keyboardType="decimal-pad"
          style={styles.input}
          placeholderTextColor={theme.placeholder}
        />
        <Text style={styles.label}>Fat goal (g, optional)</Text>
        <FormTextInput
          value={fat}
          onChangeText={setFat}
          keyboardType="decimal-pad"
          style={styles.input}
          placeholderTextColor={theme.placeholder}
        />
        <Text style={styles.hint}>
          Leave macros blank to clear them. Calorie Planner can set all four at
          once.
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
