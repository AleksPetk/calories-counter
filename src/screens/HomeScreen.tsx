import { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';

import { PinGrid } from '../components/PinGrid';
import { PrimaryButton } from '../components/PrimaryButton';
import { RemainingCaloriesCard } from '../components/RemainingCaloriesCard';
import { Screen } from '../components/Screen';
import { SearchField } from '../components/SearchField';
import { APP_TITLE, DEFAULT_DAILY_GOAL } from '../constants';
import type { LibraryListItem } from '../types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const EMPTY_LIBRARY: LibraryListItem[] = [];
const EMPTY_PINS: LibraryListItem[] = [];

function matchesQuery(name: string, query: string) {
  return name.toLowerCase().includes(query.trim().toLowerCase());
}

export function HomeScreen() {
  const [calories, setCalories] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [search, setSearch] = useState('');

  const filteredResults = !search.trim()
    ? EMPTY_LIBRARY
    : EMPTY_LIBRARY.filter((item) => matchesQuery(item.name, search));

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((value) => !value);
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.appTitle}>{APP_TITLE}</Text>

        <RemainingCaloriesCard
          summary={{
            remaining: DEFAULT_DAILY_GOAL,
            goal: DEFAULT_DAILY_GOAL,
            isUnderGoal: true,
          }}
        />

        <View style={styles.quickEntry}>
          <View style={styles.quickRow}>
            <TextInput
              value={calories}
              onChangeText={setCalories}
              placeholder="Calories"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
              style={styles.calorieInput}
            />
            <PrimaryButton label="Log" style={styles.logButton} />
          </View>

          <Pressable
            onPress={toggleExpanded}
            style={styles.expandRow}
            accessibilityRole="button"
            accessibilityLabel={
              expanded ? 'Hide optional fields' : 'Show optional fields'
            }
          >
            <Text style={styles.expandLabel}>Optional details</Text>
            <Text style={styles.expandArrow}>{expanded ? '▴' : '▾'}</Text>
          </Pressable>

          {expanded ? (
            <View style={styles.optionalFields}>
              <TextInput
                value={foodName}
                onChangeText={setFoodName}
                placeholder="Food name"
                placeholderTextColor={colors.placeholder}
                style={styles.field}
              />
              <View style={styles.macroRow}>
                <TextInput
                  value={protein}
                  onChangeText={setProtein}
                  placeholder="Protein"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="numeric"
                  style={[styles.field, styles.macroField]}
                />
                <TextInput
                  value={carbs}
                  onChangeText={setCarbs}
                  placeholder="Carbs"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="numeric"
                  style={[styles.field, styles.macroField]}
                />
                <TextInput
                  value={fat}
                  onChangeText={setFat}
                  placeholder="Fat"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="numeric"
                  style={[styles.field, styles.macroField]}
                />
              </View>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionLabel}>Pinned</Text>
        <PinGrid items={EMPTY_PINS} />

        <View style={styles.searchBlock}>
          <SearchField
            value={search}
            onChangeText={setSearch}
            placeholder="Search library"
          />
        </View>

        <View style={styles.results}>
          {filteredResults.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.resultRow,
                pressed && styles.resultPressed,
              ]}
            >
              <View style={styles.resultThumb} />
              <View style={styles.resultCopy}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultMeta}>
                  {item.kind === 'meal' ? 'Meal' : 'Food'}
                  {item.calories != null ? ` · ${item.calories} kcal` : ''}
                </Text>
              </View>
              <Text style={styles.resultAction}>Log</Text>
            </Pressable>
          ))}
          <Text style={styles.emptyResults}>No items yet</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  appTitle: {
    ...typography.appTitle,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  quickEntry: {
    marginBottom: spacing.xl,
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  calorieInput: {
    flex: 1,
    minHeight: 52,
    backgroundColor: colors.inputBackground,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.inputBorder,
    ...typography.body,
    color: colors.text,
    ...shadows.card,
  },
  logButton: {
    minWidth: 96,
  },
  expandRow: {
    marginTop: spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
    paddingHorizontal: spacing.xs,
  },
  expandLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  expandArrow: {
    ...typography.body,
    color: colors.textTertiary,
  },
  optionalFields: {
    gap: spacing.sm + 2,
    marginTop: spacing.xs,
  },
  field: {
    minHeight: 50,
    backgroundColor: colors.inputBackground,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.inputBorder,
    ...typography.body,
    color: colors.text,
  },
  macroRow: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
  },
  macroField: {
    flex: 1,
  },
  sectionLabel: {
    ...typography.section,
    color: colors.text,
    marginBottom: spacing.md,
  },
  searchBlock: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  results: {
    gap: spacing.sm,
  },
  resultRow: {
    minHeight: 68,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    ...shadows.card,
  },
  resultPressed: {
    opacity: 0.92,
  },
  resultThumb: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.thumbnail,
    marginRight: spacing.md,
  },
  resultCopy: {
    flex: 1,
  },
  resultName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  resultMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  resultAction: {
    ...typography.caption,
    color: colors.emerald,
    fontWeight: '700',
  },
  emptyResults: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
