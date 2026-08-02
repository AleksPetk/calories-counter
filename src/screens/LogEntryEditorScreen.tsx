import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import {
  FormKeyboardScroll,
  FormTextInput,
} from '../components/FormKeyboardScroll';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useData } from '../data/DataProvider';
import { useEntitlement } from '../entitlement';
import {
  parseOptionalMacroGrams,
  parsePositiveCalories,
  parsePositivePortion,
} from '../data/logging/logMath';
import type {
  HistoryStackParamList,
  HomeStackParamList,
} from '../navigation/types';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';

type Props =
  | NativeStackScreenProps<HomeStackParamList, 'LogEntryEditor'>
  | NativeStackScreenProps<HistoryStackParamList, 'LogEntryEditor'>;

export function LogEntryEditorScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { entryId } = route.params;
  const { repositories, refresh } = useData();
  const { requireWriteAccess } = useEntitlement();
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [portion, setPortion] = useState('');
  const [showPortion, setShowPortion] = useState(false);
  const [saving, setSaving] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        label: {
          ...typography.caption,
          color: theme.textSecondary,
          marginBottom: spacing.xs,
          marginTop: spacing.sm,
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
        save: {
          marginTop: spacing.xl,
        },
        hint: {
          ...typography.caption,
          color: theme.textMuted,
          marginTop: spacing.sm,
        },
      }),
    [theme],
  );

  useEffect(() => {
    if (!repositories) {
      return;
    }
    repositories.dailyLogEntries.getById(entryId).then((entry) => {
      if (!entry) {
        Alert.alert('Missing entry', 'This log entry no longer exists.');
        navigation.goBack();
        return;
      }
      setName(entry.foodNameSnapshot);
      setCalories(String(entry.calories));
      setProtein(entry.protein == null ? '' : String(entry.protein));
      setCarbs(entry.carbs == null ? '' : String(entry.carbs));
      setFat(entry.fat == null ? '' : String(entry.fat));
      setShowPortion(entry.portion != null);
      setPortion(entry.portion == null ? '' : String(entry.portion));
    });
  }, [repositories, entryId, navigation]);

  const onSave = async () => {
    if (!requireWriteAccess()) {
      return;
    }
    if (!repositories) {
      return;
    }
    const calorieValue = parsePositiveCalories(calories);
    if (!name.trim()) {
      Alert.alert('Name required', 'Enter a name for this entry.');
      return;
    }
    if (calorieValue == null) {
      Alert.alert('Calories required', 'Enter a calorie amount greater than zero.');
      return;
    }

    let portionValue: number | null = null;
    if (showPortion) {
      portionValue = parsePositivePortion(portion);
      if (portionValue == null) {
        Alert.alert('Invalid portion', 'Enter a portion greater than zero.');
        return;
      }
    }

    setSaving(true);
    try {
      await repositories.dailyLogEntries.update(entryId, {
        foodNameSnapshot: name.trim(),
        calories: calorieValue,
        protein: parseOptionalMacroGrams(protein),
        carbs: parseOptionalMacroGrams(carbs),
        fat: parseOptionalMacroGrams(fat),
        portion: showPortion ? portionValue : null,
      });
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
        <Text style={styles.label}>Name</Text>
        <FormTextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor={theme.placeholder}
        />

        <Text style={styles.label}>Calories</Text>
        <FormTextInput
          value={calories}
          onChangeText={setCalories}
          style={styles.input}
          keyboardType="numeric"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={styles.label}>Protein (g, optional)</Text>
        <FormTextInput
          value={protein}
          onChangeText={setProtein}
          style={styles.input}
          keyboardType="numeric"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={styles.label}>Carbs (g, optional)</Text>
        <FormTextInput
          value={carbs}
          onChangeText={setCarbs}
          style={styles.input}
          keyboardType="numeric"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={styles.label}>Fat (g, optional)</Text>
        <FormTextInput
          value={fat}
          onChangeText={setFat}
          style={styles.input}
          keyboardType="numeric"
          placeholderTextColor={theme.placeholder}
        />

        {showPortion ? (
          <>
            <Text style={styles.label}>Portion</Text>
            <FormTextInput
              value={portion}
              onChangeText={setPortion}
              style={styles.input}
              keyboardType="numeric"
              placeholderTextColor={theme.placeholder}
            />
            <Text style={styles.hint}>
              Editing portion does not recalculate calories — adjust calories
              manually if needed.
            </Text>
          </>
        ) : null}

        <PrimaryButton
          label={saving ? 'Saving…' : 'Save'}
          onPress={onSave}
          style={styles.save}
        />
      </FormKeyboardScroll>
    </Screen>
  );
}
