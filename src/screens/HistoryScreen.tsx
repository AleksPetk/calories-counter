import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export function HistoryScreen() {
  return (
    <Screen>
      <Text style={styles.title}>History</Text>

      <View style={styles.dateCard}>
        <Pressable
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel="Previous day"
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
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
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
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

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    ...shadows.soft,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCenter: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    ...typography.section,
    color: colors.text,
  },
  total: {
    ...typography.caption,
    color: colors.emerald,
    marginTop: 4,
    fontWeight: '700',
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
