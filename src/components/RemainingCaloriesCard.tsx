import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';

export type RemainingCaloriesSummary = {
  /** Absolute number shown in the hero (remaining OR exceeded). */
  displayAmount: number;
  goal: number;
  isUnderOrAtGoal: boolean;
  consumed: number;
};

type RemainingCaloriesCardProps = {
  summary: RemainingCaloriesSummary;
  onPress?: () => void;
};

export function RemainingCaloriesCard({
  summary,
  onPress,
}: RemainingCaloriesCardProps) {
  const theme = useTheme();
  const progress =
    summary.goal > 0
      ? Math.min(summary.consumed / summary.goal, 1)
      : summary.consumed > 0
        ? 1
        : 0;
  const progressGradient = summary.isUnderOrAtGoal
    ? theme.gradients.progressUnder
    : theme.gradients.progressOver;
  const accent = summary.isUnderOrAtGoal ? theme.success : theme.danger;
  const label = summary.isUnderOrAtGoal ? 'remaining' : 'over';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          borderRadius: radii.lg,
          marginBottom: spacing.md,
          overflow: 'hidden',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          ...theme.softShadow,
        },
        pressed: {
          opacity: 0.96,
        },
        gradient: {
          paddingHorizontal: spacing.md,
          paddingTop: spacing.md - 2,
          paddingBottom: spacing.sm + 4,
        },
        topRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        },
        value: {
          fontSize: 44,
          fontWeight: '700',
          letterSpacing: -1.4,
          lineHeight: 48,
          color: summary.isUnderOrAtGoal ? theme.textPrimary : theme.danger,
        },
        label: {
          ...typography.caption,
          color: theme.textSecondary,
          marginTop: 1,
          textTransform: 'lowercase',
        },
        goalBadge: {
          backgroundColor: theme.elevatedSurface,
          borderRadius: radii.pill,
          paddingHorizontal: spacing.sm + 2,
          paddingVertical: spacing.xs + 1,
          marginTop: 4,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
        },
        goalText: {
          ...typography.micro,
          color: theme.textSecondary,
          fontWeight: '600',
        },
        animationSlot: {
          height: 6,
        },
        track: {
          height: 6,
          borderRadius: radii.pill,
          backgroundColor: theme.progressTrack,
          overflow: 'hidden',
        },
        fill: {
          height: '100%',
          borderRadius: radii.pill,
          minWidth: 8,
        },
        accentBar: {
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          backgroundColor: accent,
        },
      }),
    [theme, accent, summary.isUnderOrAtGoal],
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={
        summary.isUnderOrAtGoal
          ? `${Math.round(summary.displayAmount)} calories remaining`
          : `${Math.round(summary.displayAmount)} calories over goal`
      }
    >
      <LinearGradient
        colors={[...theme.gradients.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.accentBar} />
        <View style={styles.topRow}>
          <View>
            <Text style={styles.value}>{Math.round(summary.displayAmount)}</Text>
            <Text style={styles.label}>{label}</Text>
          </View>
          <View style={styles.goalBadge}>
            <Text style={styles.goalText}>Goal {Math.round(summary.goal)}</Text>
          </View>
        </View>

        {/* Reserved for future subtle progress animation. */}
        <View style={styles.animationSlot} pointerEvents="none" />

        <View style={styles.track}>
          <LinearGradient
            colors={[...progressGradient]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]}
          />
        </View>
      </LinearGradient>
    </Pressable>
  );
}
