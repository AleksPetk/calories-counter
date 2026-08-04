import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  REFERENCE_STATE_LABELS,
  type ReferenceFood,
} from '../data/reference';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';

type ReferenceFoodCardProps = {
  item: ReferenceFood;
  onCopy: () => void;
};

export function ReferenceFoodCard({ item, onCopy }: ReferenceFoodCardProps) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: theme.surface,
          borderRadius: radii.lg,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          marginBottom: spacing.sm + 2,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          gap: spacing.sm,
          ...theme.cardShadow,
        },
        top: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: spacing.sm,
        },
        name: {
          ...typography.bodyBold,
          color: theme.textPrimary,
          flex: 1,
        },
        badges: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.xs,
          marginTop: spacing.xs,
        },
        badge: {
          borderRadius: radii.pill,
          paddingHorizontal: 8,
          paddingVertical: 2,
          backgroundColor: theme.elevatedSurface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
        },
        badgeText: {
          ...typography.micro,
          color: theme.textSecondary,
          fontWeight: '700',
        },
        meta: {
          ...typography.caption,
          color: theme.textSecondary,
        },
        macros: {
          ...typography.caption,
          color: theme.textMuted,
        },
        copyBtn: {
          alignSelf: 'flex-start',
          marginTop: spacing.xs,
          borderRadius: radii.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          backgroundColor: theme.elevatedSurface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.primary,
        },
        copyPressed: { opacity: 0.85 },
        copyLabel: {
          ...typography.caption,
          color: theme.primary,
          fontWeight: '700',
        },
      }),
    [theme],
  );

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={2}>
            {item.displayName}
          </Text>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {REFERENCE_STATE_LABELS[item.state]}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>100 g</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Reference</Text>
            </View>
          </View>
        </View>
      </View>
      <Text style={styles.meta}>{Math.round(item.calories)} kcal</Text>
      <Text style={styles.macros}>
        Protein {item.protein} g · Carbs {item.carbs} g · Fat {item.fat} g
      </Text>
      <Pressable
        onPress={onCopy}
        style={({ pressed }) => [styles.copyBtn, pressed && styles.copyPressed]}
        accessibilityRole="button"
        accessibilityLabel={`Copy ${item.displayName} to My Library`}
      >
        <Text style={styles.copyLabel}>Copy to My Library</Text>
      </Pressable>
    </View>
  );
}
