import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

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
  return (
    <View style={styles.wrap}>
      <Ionicons
        name="search"
        size={18}
        color={colors.textTertiary}
        style={styles.icon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        style={styles.input}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.inputBackground,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.inputBorder,
    ...shadows.card,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    paddingVertical: spacing.sm + 2,
  },
});
