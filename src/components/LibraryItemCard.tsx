import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { LibraryListItem } from '../types';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';

type LibraryItemCardProps = {
  item: LibraryListItem;
  onPress?: () => void;
  onPressPin?: () => void;
  onLongPress?: () => void;
};

export function LibraryItemCard({
  item,
  onPress,
  onPressPin,
  onLongPress,
}: LibraryItemCardProps) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: theme.surface,
          borderRadius: radii.lg,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: spacing.sm + 2,
          minHeight: 76,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          ...theme.cardShadow,
        },
        pressed: { opacity: 0.92 },
        thumbnail: {
          width: 44,
          height: 44,
          borderRadius: radii.md,
          backgroundColor: theme.thumbnail,
          marginRight: spacing.md,
        },
        main: { flex: 1, paddingRight: spacing.sm },
        nameRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        },
        name: {
          ...typography.bodyBold,
          color: theme.textPrimary,
          flexShrink: 1,
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
          marginTop: 3,
        },
        pinWrap: {
          alignItems: 'center',
          gap: 2,
          minWidth: 44,
        },
        pin: {
          ...typography.micro,
          color: theme.pin,
        },
        pinOff: {
          color: theme.textMuted,
        },
      }),
    [theme],
  );

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${Math.round(item.calories)} calories, ${item.loggingMode === 'quick' ? 'Quick Log' : 'Portion'}`}
      accessibilityHint="Long press to delete"
    >
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={styles.thumbnail}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View style={styles.thumbnail} />
      )}
      <View style={styles.main}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {item.loggingMode === 'quick' ? 'Quick' : 'Portion'}
            </Text>
          </View>
        </View>
        <Text style={styles.meta}>{Math.round(item.calories)} kcal</Text>
      </View>
      <Pressable
        onPress={onPressPin}
        style={styles.pinWrap}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={
          item.pinned ? `Unpin ${item.name}` : `Pin ${item.name}`
        }
      >
        <Ionicons
          name={item.pinned ? 'pin' : 'pin-outline'}
          size={16}
          color={item.pinned ? theme.pin : theme.textMuted}
        />
        <Text style={[styles.pin, !item.pinned && styles.pinOff]}>
          {item.pinned ? 'Pinned' : 'Pin'}
        </Text>
      </Pressable>
    </Pressable>
  );
}
