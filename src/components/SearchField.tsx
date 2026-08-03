import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search',
}: SearchFieldProps) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          backgroundColor: theme.inputBackground,
          borderRadius: radii.lg,
          paddingHorizontal: spacing.md,
          minHeight: 52,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          ...theme.cardShadow,
        },
        icon: {
          marginRight: spacing.sm,
        },
        input: {
          ...typography.body,
          color: theme.textPrimary,
          flex: 1,
          paddingVertical: spacing.sm + 2,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.wrap}>
      <Ionicons
        name="search"
        size={18}
        color={theme.textMuted}
        style={styles.icon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        accessibilityLabel={placeholder}
        accessibilityRole="search"
        style={styles.input}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        returnKeyType="search"
      />
    </View>
  );
}
