import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LibraryListItem } from '../types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type PinGridProps = {
  items: LibraryListItem[];
  onPressItem?: (item: LibraryListItem) => void;
};

export function PinGrid({ items, onPressItem }: PinGridProps) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onPressItem?.(item)}
          style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={item.name}
        >
          {/* Placeholder for future food/meal thumbnail. */}
          <View style={styles.thumbnail} />
          <View style={styles.copy}>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.calories}>
              {item.calories != null ? `${item.calories} kcal` : 'Meal'}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md - 2,
  },
  cell: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.sm + 2,
    minHeight: 118,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  thumbnail: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.thumbnail,
    marginBottom: spacing.sm,
  },
  copy: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.1,
  },
  calories: {
    ...typography.micro,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
