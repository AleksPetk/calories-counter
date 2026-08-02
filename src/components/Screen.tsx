import { ReactNode, useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing } from '../theme/spacing';
import { useTheme } from '../theme/ThemeProvider';

type ScreenProps = {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
};

export function Screen({ children, style, padded = true }: ScreenProps) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
          backgroundColor: theme.background,
        },
        content: {
          flex: 1,
          paddingHorizontal: spacing.lg - 2,
          paddingTop: spacing.md,
        },
        contentFlush: {
          flex: 1,
        },
      }),
    [theme],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={[padded ? styles.content : styles.contentFlush, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}
