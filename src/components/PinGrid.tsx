import { useMemo } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import type { LibraryListItem } from '../types';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';

type PinGridProps = {
  items: LibraryListItem[];
  onPressItem?: (item: LibraryListItem) => void;
};

const COLUMN_COUNT = 3;
const SCREEN_HORIZONTAL_PAD = (spacing.lg - 2) * 2;

export function PinGrid({ items, onPressItem }: PinGridProps) {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const gap = spacing.sm;
  const cellWidth =
    (windowWidth - SCREEN_HORIZONTAL_PAD - gap * (COLUMN_COUNT - 1)) /
    COLUMN_COUNT;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap,
        },
        cell: {
          width: cellWidth,
          backgroundColor: theme.surface,
          borderRadius: radii.md,
          padding: spacing.sm,
          minHeight: 102,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          ...theme.cardShadow,
        },
        pressed: {
          opacity: 0.92,
          transform: [{ scale: 0.98 }],
        },
        thumbnail: {
          width: 28,
          height: 28,
          borderRadius: radii.sm - 2,
          backgroundColor: theme.thumbnail,
          marginBottom: spacing.xs + 2,
        },
        badge: {
          alignSelf: 'flex-start',
          borderRadius: radii.pill,
          paddingHorizontal: 6,
          paddingVertical: 1,
          backgroundColor: theme.elevatedSurface,
          marginBottom: spacing.xs,
        },
        badgeText: {
          fontSize: 10,
          fontWeight: '700',
          color: theme.textSecondary,
        },
        copy: {
          flex: 1,
          justifyContent: 'space-between',
        },
        name: {
          fontSize: 12,
          fontWeight: '600',
          lineHeight: 15,
          color: theme.textPrimary,
          letterSpacing: -0.1,
        },
        calories: {
          ...typography.micro,
          fontSize: 11,
          color: theme.textSecondary,
          marginTop: spacing.xs,
        },
      }),
    [theme, cellWidth, gap],
  );

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
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.thumbnail} />
          ) : (
            <View style={styles.thumbnail} />
          )}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {item.loggingMode === 'quick' ? 'Quick' : 'Portion'}
            </Text>
          </View>
          <View style={styles.copy}>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.calories}>
              {Math.round(item.calories)} kcal
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
