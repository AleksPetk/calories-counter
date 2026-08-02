import { ReactNode, useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { appBrand } from '../config/appBrand';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/spacing';

type AppBrandHeaderProps = {
  /** Optional slot for a future AppLogo — replaces text when provided. */
  logo?: ReactNode;
  style?: ViewStyle;
};

/**
 * Home header brand mark. Swap `logo` later without redesigning Home layout.
 */
export function AppBrandHeader({ logo, style }: AppBrandHeaderProps) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginBottom: spacing.lg,
          minHeight: 34,
          justifyContent: 'center',
        },
        title: {
          ...typography.appTitle,
          color: theme.textPrimary,
        },
      }),
    [theme],
  );

  return (
    <View style={[styles.wrap, style]} accessibilityRole="header">
      {logo ?? <Text style={styles.title}>{appBrand.appName}</Text>}
    </View>
  );
}
