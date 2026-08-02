import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

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
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.border,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.right}>
        {value ? <Text style={styles.value}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 60,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg - 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
  },
  border: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
  label: {
    ...typography.body,
    color: colors.text,
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
    color: colors.textSecondary,
    textAlign: 'right',
    maxWidth: 170,
  },
});
