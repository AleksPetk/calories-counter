import { StyleSheet, Text } from 'react-native';

import { Screen } from '../components/Screen';
import { TAB_LABELS } from '../constants';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export function HistoryScreen() {
  return (
    <Screen>
      <Text style={styles.title}>{TAB_LABELS.history}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    color: colors.text,
  },
});
