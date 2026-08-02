import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, gradients } from '../theme/colors';
import { radii } from '../theme/radii';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export type RemainingCaloriesSummary = {
  remaining: number;
  goal: number;
  isUnderGoal: boolean;
};

type RemainingCaloriesCardProps = {
  summary: RemainingCaloriesSummary;
};

export function RemainingCaloriesCard({ summary }: RemainingCaloriesCardProps) {
  const consumed = Math.max(summary.goal - summary.remaining, 0);
  const progress = summary.goal > 0 ? Math.min(consumed / summary.goal, 1) : 0;
  const gradient = summary.isUnderGoal ? gradients.emerald : gradients.over;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${summary.remaining} calories remaining`}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={styles.value}>{summary.remaining}</Text>
          <Text style={styles.label}>remaining</Text>
        </View>
        <View style={styles.goalBadge}>
          <Text style={styles.goalText}>Goal {summary.goal}</Text>
        </View>
      </View>

      {/* Reserved for future progress animations (ring / pulse). */}
      <View style={styles.animationSlot} pointerEvents="none" />

      <View style={styles.progressBlock}>
        <View style={styles.track}>
          <LinearGradient
            colors={[...gradient]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]}
          />
        </View>
        <Text style={styles.progressCaption}>
          {consumed} of {summary.goal} kcal
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    ...shadows.soft,
  },
  pressed: {
    opacity: 0.96,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  value: {
    ...typography.calorieHero,
    color: colors.text,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    textTransform: 'lowercase',
  },
  goalBadge: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  goalText: {
    ...typography.micro,
    color: colors.textSecondary,
  },
  animationSlot: {
    height: 10,
  },
  progressBlock: {
    marginTop: spacing.xs,
  },
  track: {
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
    minWidth: 10,
  },
  progressCaption: {
    ...typography.micro,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
});
