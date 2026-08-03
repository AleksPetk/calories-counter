import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Screen } from '../../components/Screen';
import { ThemePicker } from '../../components/ThemePicker';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeProvider';

export function ThemesScreen() {
  const theme = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        hint: {
          ...typography.caption,
          color: theme.textSecondary,
          marginBottom: spacing.lg,
        },
        scrollContent: {
          paddingBottom: spacing.xxl,
        },
      }),
    [theme],
  );

  return (
    <Screen>
      <Text style={styles.hint}>Applies across the app immediately</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemePicker />
      </ScrollView>
    </Screen>
  );
}
