import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';

type BriefToastProps = {
  message: string | null;
  onHide: () => void;
  durationMs?: number;
};

/** Non-blocking auto-dismiss feedback. No OK button. */
export function BriefToast({
  message,
  onHide,
  durationMs = 1400,
}: BriefToastProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!message) {
      return;
    }
    const timer = setTimeout(onHide, durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs, onHide]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          position: 'absolute',
          left: spacing.lg,
          right: spacing.lg,
          bottom: Math.max(insets.bottom, spacing.md) + spacing.md,
          alignItems: 'center',
        },
        bubble: {
          maxWidth: '100%',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm + 2,
          borderRadius: radii.md,
          backgroundColor: theme.textPrimary,
        },
        text: {
          ...typography.caption,
          color: theme.textOnAccent,
          textAlign: 'center',
          fontWeight: '600',
        },
      }),
    [theme, insets.bottom],
  );

  if (!message) {
    return null;
  }

  return (
    <View
      style={styles.wrap}
      pointerEvents="none"
      accessibilityLiveRegion="polite"
    >
      <View style={styles.bubble}>
        <Text style={styles.text} numberOfLines={2}>
          {message}
        </Text>
      </View>
    </View>
  );
}
