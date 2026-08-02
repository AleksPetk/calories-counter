import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LibraryListItem } from '../types';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type LibraryItemCardProps = {
  item: LibraryListItem;
  onPress?: () => void;
};

export function LibraryItemCard({ item, onPress }: LibraryItemCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <View style={styles.thumbnail} />
      <View style={styles.main}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.meta}>
          {item.calories != null ? `${item.calories} kcal` : 'Meal'}
          {item.kind === 'meal' ? ' · Meal' : ' · Food'}
        </Text>
      </View>
      <View style={styles.pinWrap}>
        <Ionicons
          name={item.pinned ? 'pin' : 'pin-outline'}
          size={16}
          color={item.pinned ? colors.pin : colors.textTertiary}
        />
        <Text style={[styles.pin, !item.pinned && styles.pinOff]}>
          {item.pinned ? 'Pinned' : 'Pin'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm + 2,
    minHeight: 76,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.92,
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.thumbnail,
    marginRight: spacing.md,
  },
  main: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  name: {
    ...typography.bodyBold,
    color: colors.text,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 3,
  },
  pinWrap: {
    alignItems: 'center',
    gap: 2,
    minWidth: 44,
  },
  pin: {
    ...typography.micro,
    color: colors.pin,
  },
  pinOff: {
    color: colors.textTertiary,
  },
});
