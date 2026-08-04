import { useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { LibraryListItem } from '../types';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';
import { LibraryThumbnail } from './LibraryThumbnail';

type PinGridProps = {
  items: LibraryListItem[];
  onPressItem?: (item: LibraryListItem) => void;
};

/** Mandatory pin columns on every phone (iOS + Android). Never switch to 2. */
export const PIN_GRID_COLUMN_COUNT = 3;

/**
 * Cell width from the measured grid container (already inside Screen padding).
 * Floors so 3 cells + 2 gaps never exceed the container (avoids Android wrap-to-2).
 */
export function pinCellWidth(
  containerWidth: number,
  gap: number,
  columns: number = PIN_GRID_COLUMN_COUNT,
): number {
  if (!(containerWidth > 0) || columns < 1) {
    return 0;
  }
  const gapsTotal = gap * (columns - 1);
  return Math.floor((containerWidth - gapsTotal) / columns);
}

export function PinGrid({ items, onPressItem }: PinGridProps) {
  const theme = useTheme();
  const gap = spacing.sm;
  const [containerWidth, setContainerWidth] = useState(0);
  const cellWidth = pinCellWidth(containerWidth, gap, PIN_GRID_COLUMN_COUNT);

  const onGridLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    setContainerWidth((prev) => (prev === next ? prev : next));
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap,
          width: '100%',
        },
        cell: {
          width: cellWidth,
          maxWidth: cellWidth,
          flexGrow: 0,
          flexShrink: 0,
          backgroundColor: theme.surface,
          borderRadius: radii.md,
          padding: spacing.sm,
          minHeight: 102,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          overflow: 'hidden',
          ...theme.cardShadow,
        },
        pressed: {
          opacity: 0.92,
          transform: [{ scale: 0.98 }],
        },
        thumbnail: {
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
    <View style={styles.grid} onLayout={onGridLayout}>
      {cellWidth > 0
        ? items.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => onPressItem?.(item)}
              style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={item.name}
            >
              <LibraryThumbnail
                uri={item.image}
                size={28}
                borderRadius={radii.sm - 2}
                style={styles.thumbnail}
              />
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
          ))
        : null}
    </View>
  );
}
