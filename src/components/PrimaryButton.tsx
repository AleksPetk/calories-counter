import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, gradients } from '../theme/colors';
import { radii } from '../theme/radii';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'charcoal' | 'emerald';
};

export function PrimaryButton({
  label,
  onPress,
  style,
  variant = 'emerald',
}: PrimaryButtonProps) {
  const gradient =
    variant === 'emerald' ? gradients.buttonAccent : gradients.button;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
    >
      <LinearGradient
        colors={[...gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radii.md,
    overflow: 'hidden',
    minHeight: 52,
    ...shadows.button,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  gradient: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.bodyBold,
    color: colors.textOnAccent,
    letterSpacing: 0.2,
  },
});
