import { useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { AppBrandLogo } from './AppBrandLogo';
import { spacing } from '../theme/spacing';

type AppBrandHeaderProps = {
  style?: ViewStyle;
};

/**
 * Home header brand mark.
 */
export function AppBrandHeader({ style }: AppBrandHeaderProps) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginBottom: spacing.lg,
          minHeight: 34,
          justifyContent: 'center',
        },
      }),
    [],
  );

  return (
    <View style={[styles.wrap, style]} accessibilityRole="header">
      <AppBrandLogo variant="wordmark" height={28} />
    </View>
  );
}
