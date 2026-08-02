import { ReactNode, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';

type SectionHeaderProps = {
  title: string;
  right?: ReactNode;
};

export function SectionHeader({ title, right }: SectionHeaderProps) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.sm + 2,
          marginTop: spacing.lg,
        },
        title: {
          ...typography.section,
          color: theme.textPrimary,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {right}
    </View>
  );
}
