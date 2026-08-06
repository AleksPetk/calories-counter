import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { useData } from '../../data/DataProvider';
import {
  warningMessage,
  type PlannerWarningCode,
} from '../../data/planner';
import { nowIso } from '../../data/database/utils';
import { useEntitlement } from '../../entitlement';
import { tabBarTotalHeight } from '../../navigation/tabBarLayout';
import type { SettingsStackParamList } from '../../navigation/types';
import type { CaloriePlan } from '../../types';
import { radii } from '../../theme/radii';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeProvider';
import {
  ACTIVITY_LABELS,
  GOAL_LABELS,
  TRAINING_LABELS,
  formatAppliedDate,
  formatMacroGoalsSummary,
} from './labels';

export function CaloriePlannerScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const { repositories, refresh, reloadSettings } = useData();
  const { requireWriteAccess } = useEntitlement();
  const [plan, setPlan] = useState<CaloriePlan | null>(null);
  const [busy, setBusy] = useState(false);

  // Tab bar height already includes bottom inset — add only extra scroll gap.
  const scrollBottomPad = tabBarTotalHeight(insets.bottom) + spacing.xl;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: {
          flexGrow: 1,
          paddingBottom: scrollBottomPad,
          gap: spacing.lg,
        },
        card: {
          borderRadius: radii.xl,
          padding: spacing.lg,
          backgroundColor: theme.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          gap: spacing.sm,
          ...theme.softShadow,
        },
        title: {
          ...typography.title,
          color: theme.textPrimary,
        },
        subtitle: {
          ...typography.body,
          color: theme.textSecondary,
          lineHeight: 22,
        },
        macros: {
          ...typography.body,
          color: theme.textSecondary,
          lineHeight: 22,
        },
        sectionLabel: {
          ...typography.caption,
          color: theme.textSecondary,
          marginBottom: spacing.xs,
        },
        bigNumber: {
          ...typography.title,
          fontSize: 36,
          color: theme.textPrimary,
        },
        row: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: spacing.md,
        },
        rowLabel: {
          ...typography.body,
          color: theme.textSecondary,
          flex: 1,
        },
        rowValue: {
          ...typography.bodyBold,
          color: theme.textPrimary,
          flexShrink: 1,
          textAlign: 'right',
        },
        disclaimer: {
          ...typography.caption,
          color: theme.textMuted,
          lineHeight: 18,
        },
        warning: {
          ...typography.caption,
          color: theme.textSecondary,
          lineHeight: 18,
        },
        actions: { gap: spacing.sm, marginTop: spacing.xs },
      }),
    [theme, scrollBottomPad],
  );

  const load = useCallback(async () => {
    if (!repositories) {
      return;
    }
    const next = await repositories.caloriePlan.get();
    setPlan(next);
  }, [repositories]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onApply = async () => {
    if (!repositories || !plan || plan.targetKcal == null) {
      return;
    }
    if (!requireWriteAccess()) {
      return;
    }
    const macros = formatMacroGoalsSummary(
      plan.proteinG,
      plan.carbsG,
      plan.fatG,
    );
    Alert.alert(
      'Apply plan?',
      `Set daily goals to ${Math.round(plan.targetKcal)} kcal` +
        (macros ? `\n${macros}` : '') +
        '?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: async () => {
            setBusy(true);
            try {
              await repositories.settings.update({
                dailyGoal: plan.targetKcal!,
                proteinGoal: plan.proteinG,
                carbsGoal: plan.carbsG,
                fatGoal: plan.fatG,
              });
              await repositories.caloriePlan.markApplied(nowIso());
              await reloadSettings();
              refresh();
              await load();
              Alert.alert('Applied', 'Daily calorie and macro goals updated.');
            } catch (error) {
              Alert.alert(
                'Apply failed',
                error instanceof Error ? error.message : String(error),
              );
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  if (!plan || plan.targetKcal == null) {
    return (
      <Screen>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Calorie Planner</Text>
            <Text style={styles.subtitle}>
              Answer a short questionnaire for estimated calorie and macro
              targets. Results are estimates only — not medical advice — and
              stay fixed until you recalculate.
            </Text>
          </View>
          <PrimaryButton
            label="Start questionnaire"
            onPress={() => navigation.navigate('PlannerQuestionnaire')}
          />
          <Text style={styles.disclaimer}>
            Estimates use Mifflin–St Jeor and standard activity factors. Your
            logging history is never used.
          </Text>
        </ScrollView>
      </Screen>
    );
  }

  const macroLine = formatMacroGoalsSummary(
    plan.proteinG,
    plan.carbsG,
    plan.fatG,
  );
  const appliedLabel = plan.appliedAt
    ? formatAppliedDate(plan.appliedAt)
    : '';

  return (
    <Screen>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Recommended daily calories</Text>
          <Text style={styles.bigNumber}>{Math.round(plan.targetKcal)} kcal</Text>
          {macroLine ? <Text style={styles.macros}>{macroLine}</Text> : null}
          <Text style={styles.disclaimer}>
            Goal: {GOAL_LABELS[plan.goal]} · Estimates only · Not medical advice
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Details</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Estimated RMR</Text>
            <Text style={styles.rowValue}>
              {plan.rmrKcal != null ? `${Math.round(plan.rmrKcal)} kcal` : '—'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Estimated maintenance</Text>
            <Text style={styles.rowValue}>
              {plan.tdeeKcal != null ? `${Math.round(plan.tdeeKcal)} kcal` : '—'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Lifestyle</Text>
            <Text style={styles.rowValue}>{ACTIVITY_LABELS[plan.activity]}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Training</Text>
            <Text style={styles.rowValue}>{TRAINING_LABELS[plan.training]}</Text>
          </View>
          {appliedLabel ? (
            <Text style={styles.disclaimer}>Applied {appliedLabel}</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Important</Text>
          {(plan.warnings as PlannerWarningCode[]).map((code) => (
            <Text key={code} style={styles.warning}>
              • {warningMessage(code)}
            </Text>
          ))}
          <Text style={styles.disclaimer}>
            Method: Mifflin–St Jeor RMR × (lifestyle activity + training add-on,
            capped). Individual responses differ. No guaranteed weight change.
          </Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label={busy ? 'Working…' : 'Apply to daily goals'}
            onPress={() => {
              void onApply();
            }}
          />
          <PrimaryButton
            label="Recalculate Plan"
            variant="charcoal"
            onPress={() => navigation.navigate('PlannerQuestionnaire')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
