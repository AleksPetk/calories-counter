import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ScreenProps = {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
};

export function Screen({ children, style, padded = true }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={[padded ? styles.content : styles.contentFlush, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg - 2,
    paddingTop: spacing.md,
  },
  contentFlush: {
    flex: 1,
  },
});
