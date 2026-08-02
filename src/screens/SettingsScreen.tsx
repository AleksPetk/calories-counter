import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { SettingsRow } from '../components/SettingsRow';
import { DEFAULT_DAILY_GOAL, DEFAULT_RESET_TIME } from '../constants';
import { colors } from '../theme/colors';
import { radii } from '../theme/radii';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export function SettingsScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Settings</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.group}>
          <SettingsRow
            label="Daily calorie goal"
            value={`${DEFAULT_DAILY_GOAL} kcal`}
          />
          <SettingsRow label="Day reset time" value={DEFAULT_RESET_TIME} />
          <SettingsRow label="Replay tutorial" />
          <SettingsRow label="Purchase status" value="Trial" />
          <SettingsRow label="About" value="Calories Counter · v1.0.0" isLast />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  group: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.card,
    ...shadows.soft,
  },
});
