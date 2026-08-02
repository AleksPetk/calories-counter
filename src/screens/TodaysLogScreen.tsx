import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen } from '../components/Screen';
import { DEFAULT_RESET_TIME } from '../constants';
import { useData } from '../data/DataProvider';
import { useEntitlement } from '../entitlement';
import { getActiveDayKey } from '../data/logging/activeDay';
import { undoLastLogForActiveDay } from '../data/logging/loggingService';
import { HomeStackParamList } from '../navigation/types';
import type { DailyLogEntry } from '../types';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';

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

export function TodaysLogScreen() {
  const theme = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { repositories, revision, refresh, settings } = useData();
  const { requireWriteAccess } = useEntitlement();
  const [entries, setEntries] = useState<DailyLogEntry[]>([]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        headerActions: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          marginBottom: spacing.md,
        },
        undo: {
          ...typography.caption,
          color: theme.primary,
          fontWeight: '700',
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
    const resetTime = settings?.resetTime ?? DEFAULT_RESET_TIME;
    const day = getActiveDayKey(new Date(), resetTime);
    const rows = await repositories.dailyLogEntries.getByDate(day);
    setEntries(rows);
  }, [repositories, revision, settings]);

  useEffect(() => {
    load();
  }, [load]);

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

  const onUndo = async () => {
    if (!requireWriteAccess()) {
      return;
    }
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
  };

  return (
    <Screen>
      <View style={styles.headerActions}>
        <Pressable onPress={onUndo} hitSlop={8}>
          <Text style={styles.undo}>Undo last log</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {entries.map((entry) => {
          const macros = formatMacros(entry);
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
                {entry.sourceType === 'quick'
                  ? ' · Quick entry'
                  : entry.sourceType === 'library'
                    ? ' · Library'
                    : entry.sourceType === 'meal'
                      ? ' · Meal (legacy)'
                      : ' · Food (legacy)'}
              </Text>
              {macros ? <Text style={styles.meta}>{macros}</Text> : null}
              <View style={styles.actions}>
                <Pressable
                  onPress={() => {
                    if (!requireWriteAccess()) {
                      return;
                    }
                    navigation.navigate('LogEntryEditor', { entryId: entry.id });
                  }}
                >
                  <Text style={styles.action}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => onDelete(entry)}>
                  <Text style={[styles.action, styles.danger]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
        {entries.length === 0 ? (
          <Text style={styles.empty}>No entries logged today</Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
