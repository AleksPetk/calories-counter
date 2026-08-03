import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';

type SettingsRowProps = {
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
};

export function SettingsRow({
  label,
  value,
  onPress,
  isLast = false,
}: SettingsRowProps) {
  const theme = useTheme();
  const interactive = typeof onPress === 'function';
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          minHeight: 60,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: theme.surface,
        },
        border: {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.border,
        },
        pressed: {
          backgroundColor: theme.elevatedSurface,
        },
        label: {
          ...typography.body,
          color: theme.textPrimary,
          flexShrink: 1,
          paddingRight: spacing.sm,
        },
        right: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          flexShrink: 1,
        },
        value: {
          ...typography.caption,
          color: theme.textSecondary,
          textAlign: 'right',
          maxWidth: 170,
        },
      }),
    [theme],
  );

  const accessibilityLabel = value ? `${label}, ${value}` : label;

  return (
    <Pressable
      onPress={onPress}
      disabled={!interactive}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.border,
        interactive && pressed && styles.pressed,
      ]}
      accessibilityRole={interactive ? 'button' : 'text'}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !interactive }}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.right}>
        {value ? (
          <Text style={styles.value} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {interactive ? (
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        ) : null}
      </View>
    </Pressable>
  );
}
