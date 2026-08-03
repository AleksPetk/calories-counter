import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';

import { AppBrandHeader } from '../components/AppBrandHeader';
import { BriefToast } from '../components/BriefToast';
import {
  FormKeyboardScroll,
  FormTextInput,
} from '../components/FormKeyboardScroll';
import { PinGrid } from '../components/PinGrid';
import { PortionPickerSheet } from '../components/PortionPickerSheet';
import { PrimaryButton } from '../components/PrimaryButton';
import { RemainingCaloriesCard } from '../components/RemainingCaloriesCard';
import { Screen } from '../components/Screen';
import { SearchField } from '../components/SearchField';
import {
  DEFAULT_DAILY_GOAL,
  DEFAULT_RESET_TIME,
  PIN_SLOT_COUNT,
} from '../constants';
import { useData } from '../data/DataProvider';
import { useEntitlement } from '../entitlement';
import { getActiveDayKey } from '../data/logging/activeDay';
import {
  normalizeLoggingMode,
  resolveLibraryItemTapAction,
} from '../data/logging/libraryItemTap';
import {
  buildDayCalorieSummary,
  parseOptionalMacroGrams,
  parsePositiveCalories,
  sumCalories,
} from '../data/logging/logMath';
import {
  logLibraryPortionItem,
  logLibraryQuickItem,
  logQuickEntry,
  undoLastLogForActiveDay,
} from '../data/logging/loggingService';
import { HomeStackParamList } from '../navigation/types';
import type { LibraryItem, LibraryListItem } from '../types';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function matchesQuery(name: string, query: string) {
  return name.toLowerCase().includes(query.trim().toLowerCase());
}

export function HomeScreen() {
  const theme = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { repositories, ready, revision, refresh, settings } = useData();
  const { requireWriteAccess } = useEntitlement();
  const [calories, setCalories] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [search, setSearch] = useState('');
  const [pins, setPins] = useState<LibraryListItem[]>([]);
  const [library, setLibrary] = useState<LibraryListItem[]>([]);
  const [itemsById, setItemsById] = useState<Record<string, LibraryItem>>({});
  const [daySummary, setDaySummary] = useState(
    buildDayCalorieSummary(DEFAULT_DAILY_GOAL, 0),
  );
  const [logging, setLogging] = useState(false);
  const [portionItem, setPortionItem] = useState<LibraryItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const loggingLock = useRef(false);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        quickEntry: { marginBottom: spacing.xl },
        quickRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm + 2,
        },
        calorieInput: {
          flex: 1,
          minHeight: 52,
          backgroundColor: theme.inputBackground,
          borderRadius: radii.md,
          paddingHorizontal: spacing.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          ...typography.body,
          color: theme.textPrimary,
          ...theme.cardShadow,
        },
        logButton: { minWidth: 96 },
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
          color: theme.textSecondary,
        },
        expandArrow: {
          ...typography.body,
          color: theme.textMuted,
        },
        optionalFields: {
          gap: spacing.sm + 2,
          marginTop: spacing.xs,
        },
        field: {
          minHeight: 50,
          backgroundColor: theme.inputBackground,
          borderRadius: radii.md,
          paddingHorizontal: spacing.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          ...typography.body,
          color: theme.textPrimary,
        },
        macroRow: {
          flexDirection: 'row',
          gap: spacing.sm + 2,
        },
        macroField: { flex: 1 },
        sectionRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.md,
        },
        sectionLabel: {
          ...typography.section,
          color: theme.textPrimary,
        },
        undo: {
          ...typography.caption,
          color: theme.primary,
          fontWeight: '700',
        },
        emptyPins: {
          ...typography.caption,
          color: theme.textSecondary,
          marginBottom: spacing.md,
        },
        searchBlock: {
          marginTop: spacing.xl,
          marginBottom: spacing.md,
        },
        results: { gap: spacing.sm },
        resultRow: {
          minHeight: 68,
          borderRadius: radii.lg,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm + 2,
          backgroundColor: theme.surface,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          ...theme.cardShadow,
        },
        resultPressed: { opacity: 0.92 },
        resultThumb: {
          width: 40,
          height: 40,
          borderRadius: radii.sm,
          backgroundColor: theme.thumbnail,
          marginRight: spacing.md,
        },
        resultCopy: { flex: 1 },
        resultName: {
          ...typography.bodyBold,
          color: theme.textPrimary,
        },
        resultMeta: {
          ...typography.caption,
          color: theme.textSecondary,
          marginTop: 2,
        },
        resultAction: {
          ...typography.caption,
          color: theme.primary,
          fontWeight: '700',
        },
        emptyResults: {
          ...typography.body,
          color: theme.textSecondary,
          textAlign: 'center',
          paddingVertical: spacing.lg,
        },
        badgeInline: {
          ...typography.micro,
          color: theme.textMuted,
        },
      }),
    [theme],
  );

  const load = useCallback(async () => {
    if (!repositories) {
      return;
    }
    const goal = settings?.dailyGoal ?? DEFAULT_DAILY_GOAL;
    const resetTime = settings?.resetTime ?? DEFAULT_RESET_TIME;
    const activeDay = getActiveDayKey(new Date(), resetTime);
    const logEntries = await repositories.dailyLogEntries.getByDate(activeDay);
    setDaySummary(buildDayCalorieSummary(goal, sumCalories(logEntries)));

    const all = await repositories.libraryItems.getAll();
    const map: Record<string, LibraryItem> = {};
    const list: LibraryListItem[] = all.map((item) => {
      map[item.id] = item;
      return {
        id: item.id,
        name: item.name,
        calories: item.calories,
        loggingMode: item.loggingMode,
        pinned: item.pinned,
        image: item.image,
      };
    });
    setItemsById(map);
    setLibrary(list);
    setPins(list.filter((item) => item.pinned).slice(0, PIN_SLOT_COUNT));
  }, [repositories, revision, settings]);

  useEffect(() => {
    load();
  }, [load]);

  const withLogLock = async (action: () => Promise<void>) => {
    if (loggingLock.current) {
      return;
    }
    loggingLock.current = true;
    setLogging(true);
    try {
      await action();
    } finally {
      loggingLock.current = false;
      setLogging(false);
    }
  };

  const clearQuickForm = () => {
    setCalories('');
    setFoodName('');
    setProtein('');
    setCarbs('');
    setFat('');
  };

  const onQuickLog = () => {
    if (!requireWriteAccess()) {
      return;
    }
    void withLogLock(async () => {
      if (!repositories) {
        return;
      }
      const calorieValue = parsePositiveCalories(calories);
      if (calorieValue == null) {
        Alert.alert(
          'Calories required',
          'Enter a calorie amount greater than zero.',
        );
        return;
      }
      await logQuickEntry(
        repositories,
        {
          calories: calorieValue,
          name: expanded ? foodName : undefined,
          protein: expanded ? parseOptionalMacroGrams(protein) : null,
          carbs: expanded ? parseOptionalMacroGrams(carbs) : null,
          fat: expanded ? parseOptionalMacroGrams(fat) : null,
        },
        { settings: settings ?? undefined },
      );
      Keyboard.dismiss();
      clearQuickForm();
      refresh();
      showToast('Logged');
    });
  };

  const onLibraryItem = (listItem: LibraryListItem) => {
    if (!requireWriteAccess()) {
      return;
    }
    const item = itemsById[listItem.id];
    if (!item) {
      Alert.alert('Missing item', 'That item is no longer in your library.');
      return;
    }
    // Route from the badge source (list item), not a divergent cache field.
    const action = resolveLibraryItemTapAction(listItem.loggingMode);
    if (action === 'quick-log') {
      void withLogLock(async () => {
        if (!repositories) {
          return;
        }
        const quickItem: LibraryItem = {
          ...item,
          loggingMode: normalizeLoggingMode(listItem.loggingMode),
        };
        await logLibraryQuickItem(repositories, quickItem, {
          settings: settings ?? undefined,
        });
        Keyboard.dismiss();
        refresh();
        showToast(item.name);
        });
      return;
    }
    setPortionItem({
      ...item,
      loggingMode: 'portion',
    });
  };

  const onPortionConfirm = (portion: number) => {
    if (!requireWriteAccess()) {
      return;
    }
    void withLogLock(async () => {
      if (!repositories || !portionItem) {
        return;
      }
      const name = portionItem.name;
      await logLibraryPortionItem(repositories, portionItem, portion, {
        settings: settings ?? undefined,
      });
      Keyboard.dismiss();
      setPortionItem(null);
      refresh();
      showToast(`${name} × ${portion}`);
    });
  };

  const onUndo = () => {
    if (!requireWriteAccess()) {
      return;
    }
    void withLogLock(async () => {
      if (!repositories) {
        return;
      }
      const removed = await undoLastLogForActiveDay(repositories, {
        settings: settings ?? undefined,
      });
      if (!removed) {
        Alert.alert('Nothing to undo', 'No entries logged for today yet.');
        return;
      }
      refresh();
      showToast(`Undone · ${removed.foodNameSnapshot}`);
    });
  };

  const filteredResults = !search.trim()
    ? library
    : library.filter((item) => matchesQuery(item.name, search));

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((value) => !value);
  };

  return (
    <Screen>
      <FormKeyboardScroll>
        <AppBrandHeader />

        <RemainingCaloriesCard
          summary={{
            displayAmount: daySummary.isUnderOrAtGoal
              ? daySummary.remaining
              : daySummary.exceeded,
            goal: daySummary.goal,
            isUnderOrAtGoal: daySummary.isUnderOrAtGoal,
            consumed: daySummary.consumed,
          }}
          onPress={() => navigation.navigate('TodaysLog')}
        />
        <View style={styles.quickEntry}>
          <View style={styles.quickRow}>
            <FormTextInput
              value={calories}
              onChangeText={setCalories}
              placeholder="Calories"
              placeholderTextColor={theme.placeholder}
              keyboardType="numeric"
              style={styles.calorieInput}
            />
            <PrimaryButton
              label={logging ? '…' : 'Log'}
              style={styles.logButton}
              onPress={onQuickLog}
            />
          </View>

          <Pressable
            onPress={toggleExpanded}
            style={styles.expandRow}
            accessibilityRole="button"
          >
            <Text style={styles.expandLabel}>Optional details</Text>
            <Text style={styles.expandArrow}>{expanded ? '▴' : '▾'}</Text>
          </Pressable>

          {expanded ? (
            <View style={styles.optionalFields}>
              <FormTextInput
                value={foodName}
                onChangeText={setFoodName}
                placeholder="Food name"
                placeholderTextColor={theme.placeholder}
                style={styles.field}
              />
              <View style={styles.macroRow}>
                <FormTextInput
                  value={protein}
                  onChangeText={setProtein}
                  placeholder="Protein g"
                  placeholderTextColor={theme.placeholder}
                  keyboardType="numeric"
                  style={[styles.field, styles.macroField]}
                />
                <FormTextInput
                  value={carbs}
                  onChangeText={setCarbs}
                  placeholder="Carbs g"
                  placeholderTextColor={theme.placeholder}
                  keyboardType="numeric"
                  style={[styles.field, styles.macroField]}
                />
                <FormTextInput
                  value={fat}
                  onChangeText={setFat}
                  placeholder="Fat g"
                  placeholderTextColor={theme.placeholder}
                  keyboardType="numeric"
                  style={[styles.field, styles.macroField]}
                />
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Pinned</Text>
          <Pressable
            onPress={onUndo}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Undo last log"
          >
            <Text style={styles.undo}>Undo last</Text>
          </Pressable>
        </View>
        {ready && pins.length === 0 ? (
          <Text style={styles.emptyPins}>Pin items from Library</Text>
        ) : (
          <PinGrid items={pins} onPressItem={onLibraryItem} />
        )}

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
              onPress={() => onLibraryItem(item)}
              style={({ pressed }) => [
                styles.resultRow,
                pressed && styles.resultPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Log ${item.name}`}
            >
              <View style={styles.resultThumb} />
              <View style={styles.resultCopy}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultMeta}>
                  {Math.round(item.calories)} kcal ·{' '}
                  <Text style={styles.badgeInline}>
                    {item.loggingMode === 'quick' ? 'Quick' : 'Portion'}
                  </Text>
                </Text>
              </View>
              <Text style={styles.resultAction}>Log</Text>
            </Pressable>
          ))}
          {ready && filteredResults.length === 0 ? (
            <Text style={styles.emptyResults}>
              {search.trim() ? 'No matches' : 'No items yet'}
            </Text>
          ) : null}
        </View>
      </FormKeyboardScroll>

      <PortionPickerSheet
        visible={portionItem != null}
        item={portionItem}
        confirming={logging}
        onCancel={() => {
          Keyboard.dismiss();
          setPortionItem(null);
        }}
        onConfirm={onPortionConfirm}
      />

      <BriefToast
        message={toastMessage}
        onHide={() => setToastMessage(null)}
      />
    </Screen>
  );
}
