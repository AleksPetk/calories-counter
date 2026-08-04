import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import {
  FormKeyboardScroll,
  FormTextInput,
} from '../../components/FormKeyboardScroll';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { useData } from '../../data/DataProvider';
import { nowIso } from '../../data/database/utils';
import {
  availableGoalsForBmi,
  computeBmi,
  computePlannerRecommendation,
  defaultUnitPrefForNewPlan,
  feetInchesToCm,
  cmToFeetInches,
  kgToLb,
  lbToKg,
  type LifestyleActivity,
  type PlannerGoal,
  type PlannerSex,
  type TrainingFrequency,
  type UnitPref,
} from '../../data/planner';
import type { SettingsStackParamList } from '../../navigation/types';
import { radii } from '../../theme/radii';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeProvider';
import {
  ACTIVITY_HINTS,
  ACTIVITY_LABELS,
  GOAL_LABELS,
  TRAINING_LABELS,
} from './labels';

const SEX_OPTIONS: { id: PlannerSex; label: string }[] = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
];

const ACTIVITY_OPTIONS = Object.keys(ACTIVITY_LABELS) as LifestyleActivity[];
const TRAINING_OPTIONS = Object.keys(TRAINING_LABELS) as TrainingFrequency[];

function ChoiceChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radii.pill,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: selected ? theme.primary : theme.border,
        backgroundColor: selected ? theme.elevatedSurface : theme.surface,
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text
        style={{
          ...typography.caption,
          color: selected ? theme.primary : theme.textSecondary,
          fontWeight: selected ? '700' : '500',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function PlannerQuestionnaireScreen() {
  const theme = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const { repositories } = useData();

  const [unitPref, setUnitPref] = useState<UnitPref>(defaultUnitPrefForNewPlan());
  const [sex, setSex] = useState<PlannerSex>('male');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState<LifestyleActivity>('light');
  const [training, setTraining] = useState<TrainingFrequency>('none');
  const [goal, setGoal] = useState<PlannerGoal>('maintenance');
  const [pregnant, setPregnant] = useState(false);
  const [edScreening, setEdScreening] = useState(false);
  const [ageOver80Ack, setAgeOver80Ack] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!repositories) {
        return;
      }
      const existing = await repositories.caloriePlan.get();
      if (cancelled) {
        return;
      }
      if (existing) {
        setUnitPref(existing.unitPref);
        setSex(existing.sex);
        setAge(String(existing.age));
        if (existing.unitPref === 'metric') {
          setHeightCm(String(Math.round(existing.heightCm)));
          setWeight(String(Math.round(existing.weightKg * 10) / 10));
        } else {
          const hi = cmToFeetInches(existing.heightCm);
          setFeet(String(hi.feet));
          setInches(String(hi.inches));
          setWeight(String(Math.round(kgToLb(existing.weightKg) * 10) / 10));
        }
        setActivity(existing.activity);
        setTraining(existing.training);
        setGoal(existing.goal);
        setPregnant(existing.pregnantOrBreastfeeding);
        setEdScreening(existing.edScreening);
        setAgeOver80Ack(existing.ageOver80Acknowledged);
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [repositories]);

  const ageNum = Number.parseInt(age, 10);
  const showAgeAck = Number.isFinite(ageNum) && ageNum > 80;

  const previewBmi = useMemo(() => {
    let cm: number | null = null;
    let kg: number | null = null;
    if (unitPref === 'metric') {
      const h = Number.parseFloat(heightCm);
      const w = Number.parseFloat(weight);
      if (Number.isFinite(h) && Number.isFinite(w)) {
        cm = h;
        kg = w;
      }
    } else {
      const f = Number.parseFloat(feet);
      const inch = Number.parseFloat(inches || '0');
      const w = Number.parseFloat(weight);
      if (Number.isFinite(f) && Number.isFinite(w)) {
        cm = feetInchesToCm(f, Number.isFinite(inch) ? inch : 0);
        kg = lbToKg(w);
      }
    }
    if (cm == null || kg == null) {
      return null;
    }
    const bmi = computeBmi(kg, cm);
    return Number.isFinite(bmi) ? bmi : null;
  }, [unitPref, heightCm, feet, inches, weight]);

  const goalOptions = useMemo(() => {
    if (previewBmi == null) {
      return Object.keys(GOAL_LABELS) as PlannerGoal[];
    }
    return availableGoalsForBmi(previewBmi);
  }, [previewBmi]);

  useEffect(() => {
    if (goalOptions.length > 0 && !goalOptions.includes(goal)) {
      setGoal(goalOptions[0]!);
    }
  }, [goalOptions, goal]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        label: {
          ...typography.caption,
          color: theme.textSecondary,
          marginBottom: spacing.xs,
          marginTop: spacing.md,
        },
        hint: {
          ...typography.caption,
          color: theme.textMuted,
          marginBottom: spacing.sm,
          lineHeight: 18,
        },
        input: {
          minHeight: 48,
          borderRadius: radii.md,
          backgroundColor: theme.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          paddingHorizontal: spacing.md,
          ...typography.body,
          color: theme.textPrimary,
        },
        row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
        dual: { flexDirection: 'row', gap: spacing.sm },
        dualItem: { flex: 1 },
        switchRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.md,
          marginTop: spacing.md,
          paddingVertical: spacing.sm,
        },
        switchLabel: {
          ...typography.body,
          color: theme.textPrimary,
          flex: 1,
        },
        save: { marginTop: spacing.xl, marginBottom: spacing.xxl },
      }),
    [theme],
  );

  const onCalculate = async () => {
    if (!repositories) {
      return;
    }
    const parsedAge = Number.parseInt(age, 10);
    if (!Number.isFinite(parsedAge)) {
      Alert.alert('Age required', 'Enter your age in years.');
      return;
    }

    let heightCmValue: number;
    let weightKgValue: number;
    if (unitPref === 'metric') {
      heightCmValue = Number.parseFloat(heightCm);
      weightKgValue = Number.parseFloat(weight);
    } else {
      const f = Number.parseFloat(feet);
      const inch = Number.parseFloat(inches || '0');
      const lb = Number.parseFloat(weight);
      if (!Number.isFinite(f) || !Number.isFinite(lb)) {
        Alert.alert('Height and weight required', 'Enter feet and pounds.');
        return;
      }
      heightCmValue = feetInchesToCm(f, Number.isFinite(inch) ? inch : 0);
      weightKgValue = lbToKg(lb);
    }

    if (!Number.isFinite(heightCmValue) || !Number.isFinite(weightKgValue)) {
      Alert.alert('Height and weight required', 'Enter valid numbers.');
      return;
    }

    const outcome = computePlannerRecommendation({
      sex,
      age: parsedAge,
      heightCm: heightCmValue,
      weightKg: weightKgValue,
      unitPref,
      activity,
      training,
      goal,
      pregnantOrBreastfeeding: pregnant,
      edScreening,
      ageOver80Acknowledged: ageOver80Ack,
    });

    if (!outcome.ok) {
      Alert.alert('Cannot estimate', outcome.message);
      return;
    }

    setSaving(true);
    try {
      const calculatedAt = nowIso();
      const existing = await repositories.caloriePlan.get();
      await repositories.caloriePlan.upsert({
        sex,
        age: parsedAge,
        heightCm: heightCmValue,
        weightKg: weightKgValue,
        unitPref,
        activity,
        training,
        goal,
        pregnantOrBreastfeeding: pregnant,
        edScreening,
        ageOver80Acknowledged: ageOver80Ack,
        rmrKcal: outcome.result.rmrKcal,
        tdeeKcal: outcome.result.tdeeKcal,
        targetKcal: outcome.result.targetKcal,
        proteinG: outcome.result.macros.proteinG,
        carbsG: outcome.result.macros.carbsG,
        fatG: outcome.result.macros.fatG,
        bmi: outcome.result.bmi,
        warnings: outcome.result.warnings,
        calculatedAt,
        appliedAt: existing?.appliedAt ?? null,
        formulaVersion: outcome.result.formulaVersion,
      });
      navigation.navigate('CaloriePlanner');
    } catch (error) {
      Alert.alert(
        'Save failed',
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <Screen>
        <Text style={{ ...typography.body, color: theme.textSecondary }}>
          Loading…
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <FormKeyboardScroll>
        <Text style={styles.hint}>
          Estimates only. Not medical advice. Logging history is never used.
        </Text>

        <Text style={styles.label}>Units</Text>
        <View style={styles.row}>
          <ChoiceChip
            label="Metric"
            selected={unitPref === 'metric'}
            onPress={() => setUnitPref('metric')}
          />
          <ChoiceChip
            label="Imperial"
            selected={unitPref === 'imperial'}
            onPress={() => setUnitPref('imperial')}
          />
        </View>

        <Text style={styles.label}>Sex (for the equation)</Text>
        <Text style={styles.hint}>
          Mifflin–St Jeor uses biological sex coefficients. This is not a
          gender identity field.
        </Text>
        <View style={styles.row}>
          {SEX_OPTIONS.map((option) => (
            <ChoiceChip
              key={option.id}
              label={option.label}
              selected={sex === option.id}
              onPress={() => setSex(option.id)}
            />
          ))}
        </View>

        <Text style={styles.label}>Age (years)</Text>
        <FormTextInput
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad"
          style={styles.input}
          placeholderTextColor={theme.placeholder}
        />
        {showAgeAck ? (
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              I understand estimates may be less reliable over age 80
            </Text>
            <Switch value={ageOver80Ack} onValueChange={setAgeOver80Ack} />
          </View>
        ) : null}

        {unitPref === 'metric' ? (
          <>
            <Text style={styles.label}>Height (cm)</Text>
            <FormTextInput
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="decimal-pad"
              style={styles.input}
              placeholderTextColor={theme.placeholder}
            />
            <Text style={styles.label}>Weight (kg)</Text>
            <FormTextInput
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              style={styles.input}
              placeholderTextColor={theme.placeholder}
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Height</Text>
            <View style={styles.dual}>
              <View style={styles.dualItem}>
                <FormTextInput
                  value={feet}
                  onChangeText={setFeet}
                  keyboardType="number-pad"
                  style={styles.input}
                  placeholder="ft"
                  placeholderTextColor={theme.placeholder}
                />
              </View>
              <View style={styles.dualItem}>
                <FormTextInput
                  value={inches}
                  onChangeText={setInches}
                  keyboardType="number-pad"
                  style={styles.input}
                  placeholder="in"
                  placeholderTextColor={theme.placeholder}
                />
              </View>
            </View>
            <Text style={styles.label}>Weight (lb)</Text>
            <FormTextInput
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              style={styles.input}
              placeholderTextColor={theme.placeholder}
            />
          </>
        )}

        <Text style={styles.label}>Day-to-day activity</Text>
        <Text style={styles.hint}>
          Describe your usual day without counting workouts. Training is added
          separately so exercise is not counted twice.
        </Text>
        <View style={styles.row}>
          {ACTIVITY_OPTIONS.map((id) => (
            <ChoiceChip
              key={id}
              label={ACTIVITY_LABELS[id]}
              selected={activity === id}
              onPress={() => setActivity(id)}
            />
          ))}
        </View>
        <Text style={styles.hint}>{ACTIVITY_HINTS[activity]}</Text>

        <Text style={styles.label}>Structured training</Text>
        <Text style={styles.hint}>
          Resistance or cardio sessions per week. Adds a small activity bump and
          may raise protein slightly — it does not re-apply your lifestyle
          multiplier.
        </Text>
        <View style={styles.row}>
          {TRAINING_OPTIONS.map((id) => (
            <ChoiceChip
              key={id}
              label={TRAINING_LABELS[id]}
              selected={training === id}
              onPress={() => setTraining(id)}
            />
          ))}
        </View>

        <Text style={styles.label}>Goal</Text>
        <View style={styles.row}>
          {goalOptions.map((id) => (
            <ChoiceChip
              key={id}
              label={GOAL_LABELS[id]}
              selected={goal === id}
              onPress={() => setGoal(id)}
            />
          ))}
        </View>
        {previewBmi != null && previewBmi < 18.5 ? (
          <Text style={styles.hint}>
            Loss goals are hidden at a low BMI. Speak with a clinician if unsure.
          </Text>
        ) : null}

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>
            Pregnant or breastfeeding
          </Text>
          <Switch value={pregnant} onValueChange={setPregnant} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>
            Eating disorder history or currently in treatment
          </Text>
          <Switch value={edScreening} onValueChange={setEdScreening} />
        </View>

        <PrimaryButton
          label={saving ? 'Saving…' : 'Calculate estimate'}
          onPress={() => {
            void onCalculate();
          }}
          style={styles.save}
        />
      </FormKeyboardScroll>
    </Screen>
  );
}
