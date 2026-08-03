import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';

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
  const theme = useTheme();
  const gradient =
    variant === 'emerald'
      ? theme.gradients.buttonAccent
      : theme.gradients.button;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          borderRadius: radii.md,
          overflow: 'hidden',
          minHeight: 52,
          ...theme.buttonShadow,
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
          color: theme.textOnAccent,
          letterSpacing: 0.2,
        },
      }),
    [theme],
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed, style]}
      accessibilityRole="button"
      accessibilityLabel={label}
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
