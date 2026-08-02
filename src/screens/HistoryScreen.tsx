import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';

export function HistoryScreen() {
  const theme = useTheme();
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
        dateCenter: {
          flex: 1,
          alignItems: 'center',
        },
        dateLabel: {
          ...typography.caption,
          color: theme.textSecondary,
        },
        total: {
          ...typography.section,
          color: theme.textPrimary,
          marginTop: 2,
        },
        list: {
          paddingBottom: spacing.xxl,
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

  return (
    <Screen>
      <Text style={styles.title}>History</Text>

      <View style={styles.dateCard}>
        <Pressable
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel="Previous day"
        >
          <Ionicons name="chevron-back" size={20} color={theme.textPrimary} />
        </Pressable>

        <View style={styles.dateCenter}>
          <Text style={styles.dateLabel}>Today</Text>
          <Text style={styles.total}>0 kcal</Text>
        </View>

        <Pressable
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel="Next day"
        >
          <Ionicons name="chevron-forward" size={20} color={theme.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        <Text style={styles.empty}>No entries yet</Text>
      </ScrollView>
    </Screen>
  );
}
