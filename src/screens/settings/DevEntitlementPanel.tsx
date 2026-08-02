import { Alert, StyleSheet, Text, View } from 'react-native';

import { SettingsRow } from '../../components/SettingsRow';
import { useEntitlement } from '../../entitlement';
import { formatRemainingTrial } from '../../entitlement/formatRemaining';
import { radii } from '../../theme/radii';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * __DEV__-only entitlement testing panel.
 * Never rendered in production builds (caller must gate with __DEV__).
 */
export function DevEntitlementPanel() {
  const theme = useTheme();
  const {
    snapshot,
    devStartFreshTrial,
    devSetOneMinuteRemaining,
    devExpireTrialNow,
    devSimulatePurchased,
    devResetSimulated,
  } = useEntitlement();

  const run = async (label: string, action: () => Promise<void>) => {
    try {
      await action();
      Alert.alert('DEV', `${label} applied.`);
    } catch (error) {
      Alert.alert(
        'DEV blocked',
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  const styles = StyleSheet.create({
    group: {
      borderRadius: radii.xl,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      ...theme.softShadow,
    },
    sectionLabel: {
      ...typography.caption,
      color: theme.danger,
      marginBottom: spacing.sm,
      marginLeft: spacing.xs,
      fontWeight: '700',
    },
    hint: {
      ...typography.caption,
      color: theme.textMuted,
      marginBottom: spacing.sm,
      marginLeft: spacing.xs,
    },
  });

  const statusBits = [
    snapshot?.accessState ?? '…',
    snapshot?.isStorePurchase ? 'store' : null,
    snapshot?.isSimulatedPurchase ? 'simulated' : null,
    snapshot?.accessState === 'trial_active'
      ? formatRemainingTrial(snapshot.remainingMs)
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View>
      <Text style={styles.sectionLabel}>DEV · Entitlement tools</Text>
      <Text style={styles.hint}>
        Never overwrites a confirmed real-store purchase. Status: {statusBits}
      </Text>
      <View style={styles.group}>
        <SettingsRow
          label="Start fresh test trial"
          value="14d"
          onPress={() => {
            void run('Fresh trial', devStartFreshTrial);
          }}
        />
        <SettingsRow
          label="Set test trial to 1 minute"
          onPress={() => {
            void run('1 minute remaining', devSetOneMinuteRemaining);
          }}
        />
        <SettingsRow
          label="Expire test trial now"
          onPress={() => {
            void run('Trial expired', devExpireTrialNow);
          }}
        />
        <SettingsRow
          label="Simulate purchased"
          value="DEV"
          onPress={() => {
            void run('Simulated purchase', devSimulatePurchased);
          }}
        />
        <SettingsRow
          label="Reset simulated entitlement"
          onPress={() => {
            void run('Reset simulated', devResetSimulated);
          }}
          isLast
        />
      </View>
    </View>
  );
}
