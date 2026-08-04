import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';

import { Screen } from '../components/Screen';
import { DEFAULT_RESET_TIME } from '../constants';
import { useData } from '../data/DataProvider';
import { useEntitlement } from '../entitlement';
import { getActiveDayKey } from '../data/logging/activeDay';
import { shiftDateKey } from '../data/history/historyRetention';
import { sumCalories, sumMacros } from '../data/logging/logMath';
import { HistoryStackParamList } from '../navigation/types';
import type { DailyLogEntry } from '../types';
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

function formatLogTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDayLabel(dateKey: string, activeDayKey: string): string {
  if (dateKey === activeDayKey) {
    return 'Today';
  }
  const yesterday = shiftDateKey(activeDayKey, -1);
  if (dateKey === yesterday) {
    return 'Yesterday';
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) {
    return dateKey;
  }
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatMacros(entry: DailyLogEntry): string | null {
  const parts: string[] = [];
  if (entry.protein != null) {
    parts.push(`P ${round(entry.protein)}g`);
  }
  if (entry.carbs != null) {
    parts.push(`C ${round(entry.carbs)}g`);
  }
  if (entry.fat != null) {
    parts.push(`F ${round(entry.fat)}g`);
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}

function round(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatMacroGrams(value: number): string {
  return `${round(value)} g`;
}

export function HistoryScreen() {
  const theme = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<HistoryStackParamList>>();
  const { repositories, revision, refresh, settings } = useData();
  const { requireWriteAccess } = useEntitlement();
  const resetTime = settings?.resetTime ?? DEFAULT_RESET_TIME;
  const activeDayKey = getActiveDayKey(new Date(), resetTime);
  const [selectedDay, setSelectedDay] = useState(activeDayKey);
  const [entries, setEntries] = useState<DailyLogEntry[]>([]);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  useEffect(() => {
    setSelectedDay(activeDayKey);
  }, [activeDayKey]);

  useEffect(() => {
    setSummaryExpanded(false);
  }, [selectedDay]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        title: {
          ...typography.title,
          color: theme.textPrimary,
          marginBottom: spacing.lg,
        },
        dateCard: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: spacing.lg,
          backgroundColor: theme.surface,
          borderRadius: radii.xl,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.sm,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          ...theme.softShadow,
        },
        navButton: {
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radii.md,
          backgroundColor: theme.elevatedSurface,
        },
        navDisabled: {
          opacity: 0.35,
        },
        dateCenter: {
          flex: 1,
          alignItems: 'center',
          paddingHorizontal: spacing.xs,
        },
        dateLabel: {
          ...typography.caption,
          color: theme.textSecondary,
        },
        dateKey: {
          ...typography.micro,
          color: theme.textMuted,
          marginTop: 2,
        },
        total: {
          ...typography.section,
          color: theme.textPrimary,
          marginTop: 2,
        },
        expandHint: {
          ...typography.micro,
          color: theme.textMuted,
          marginTop: 4,
        },
        expandedBlock: {
          alignSelf: 'stretch',
          marginTop: spacing.sm,
          gap: spacing.xs,
          paddingTop: spacing.sm,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.border,
        },
        macroRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          width: '100%',
          paddingHorizontal: spacing.sm,
        },
        macroLabel: {
          ...typography.caption,
          color: theme.textSecondary,
        },
        macroValue: {
          ...typography.bodyBold,
          color: theme.textPrimary,
        },
        list: {
          paddingBottom: spacing.xxl,
          gap: spacing.sm,
        },
        row: {
          backgroundColor: theme.surface,
          borderRadius: radii.lg,
          padding: spacing.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          ...theme.cardShadow,
        },
        top: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: spacing.md,
        },
        name: {
          ...typography.bodyBold,
          color: theme.textPrimary,
          flex: 1,
        },
        calories: {
          ...typography.bodyBold,
          color: theme.primary,
        },
        meta: {
          ...typography.caption,
          color: theme.textSecondary,
          marginTop: 4,
        },
        actions: {
          flexDirection: 'row',
          gap: spacing.lg,
          marginTop: spacing.sm,
        },
        action: {
          ...typography.caption,
          fontWeight: '700',
          color: theme.primary,
        },
        danger: {
          color: theme.danger,
        },
        empty: {
          ...typography.body,
          color: theme.textSecondary,
          textAlign: 'center',
          paddingVertical: spacing.xl,
        },
      }),
    [theme],
  );

  const load = useCallback(async () => {
    if (!repositories) {
      return;
    }
    const rows = await repositories.dailyLogEntries.getByDate(selectedDay);
    setEntries(rows);
  }, [repositories, revision, selectedDay]);

  useEffect(() => {
    load();
  }, [load]);

  const total = sumCalories(entries);
  const macros = sumMacros(entries);
  const canGoNext = selectedDay < activeDayKey;

  const toggleSummary = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSummaryExpanded((value) => !value);
  };

  const onDelete = (entry: DailyLogEntry) => {
    if (!requireWriteAccess()) {
      return;
    }
    Alert.alert('Delete entry?', entry.foodNameSnapshot, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!repositories) {
            return;
          }
          await repositories.dailyLogEntries.delete(entry.id);
          refresh();
        },
      },
    ]);
  };

  return (
    <Screen>
      <Text style={styles.title}>History</Text>

      <View style={styles.dateCard}>
        <Pressable
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel="Previous day"
          onPress={() => setSelectedDay((day) => shiftDateKey(day, -1))}
        >
          <Ionicons name="chevron-back" size={20} color={theme.textPrimary} />
        </Pressable>

        <Pressable
          style={styles.dateCenter}
          onPress={toggleSummary}
          accessibilityRole="button"
          accessibilityLabel={
            summaryExpanded
              ? 'Collapse day nutrition summary'
              : 'Expand day nutrition summary'
          }
          accessibilityState={{ expanded: summaryExpanded }}
        >
          <Text style={styles.dateLabel}>
            {formatDayLabel(selectedDay, activeDayKey)}
          </Text>
          <Text style={styles.dateKey}>{selectedDay}</Text>
          {!summaryExpanded ? (
            <Text style={styles.total}>{Math.round(total)} kcal</Text>
          ) : (
            <View style={styles.expandedBlock}>
              <View style={styles.macroRow}>
                <Text style={styles.macroLabel}>Calories</Text>
                <Text style={styles.macroValue}>{Math.round(total)} kcal</Text>
              </View>
              <View style={styles.macroRow}>
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroValue}>
                  {formatMacroGrams(macros.protein)}
                </Text>
              </View>
              <View style={styles.macroRow}>
                <Text style={styles.macroLabel}>Carbs</Text>
                <Text style={styles.macroValue}>
                  {formatMacroGrams(macros.carbs)}
                </Text>
              </View>
              <View style={styles.macroRow}>
                <Text style={styles.macroLabel}>Fat</Text>
                <Text style={styles.macroValue}>
                  {formatMacroGrams(macros.fat)}
                </Text>
              </View>
            </View>
          )}
          <Text style={styles.expandHint}>
            {summaryExpanded ? 'Tap to collapse' : 'Tap for macros'}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.navButton, !canGoNext && styles.navDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Next day"
          disabled={!canGoNext}
          onPress={() => {
            if (!canGoNext) {
              return;
            }
            setSelectedDay((day) => shiftDateKey(day, 1));
          }}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.textPrimary}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {entries.map((entry) => {
          const entryMacros = formatMacros(entry);
          return (
            <View key={entry.id} style={styles.row}>
              <View style={styles.top}>
                <Text style={styles.name}>{entry.foodNameSnapshot}</Text>
                <Text style={styles.calories}>
                  {Math.round(entry.calories)} kcal
                </Text>
              </View>
              <Text style={styles.meta}>
                {formatLogTime(entry.time)}
                {entry.portion != null ? ` · ×${entry.portion}` : ''}
              </Text>
              {entryMacros ? (
                <Text style={styles.meta}>{entryMacros}</Text>
              ) : null}
              <View style={styles.actions}>
                <Pressable
                  onPress={() => {
                    if (!requireWriteAccess()) {
                      return;
                    }
                    navigation.navigate('LogEntryEditor', {
                      entryId: entry.id,
                    });
                  }}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${entry.foodNameSnapshot}`}
                >
                  <Text style={styles.action}>Edit</Text>
                </Pressable>
                <Pressable
                  onPress={() => onDelete(entry)}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${entry.foodNameSnapshot}`}
                >
                  <Text style={[styles.action, styles.danger]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
        {entries.length === 0 ? (
          <Text style={styles.empty}>No entries for this day</Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
