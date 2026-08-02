import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
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
import { useEntitlement } from '../../entitlement';
import {
  deletePersistedProfileImage,
  replacePersistedProfileImage,
} from '../../data/images/profileImages';
import type { GoalType } from '../../types';
import { radii } from '../../theme/radii';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeProvider';

const GOAL_OPTIONS: { label: string; value: GoalType }[] = [
  { label: 'Lose Weight', value: 'lose' },
  { label: 'Maintain Weight', value: 'maintain' },
  { label: 'Gain Weight', value: 'gain' },
];

function parseOptionalPositive(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num <= 0) {
    return null;
  }
  return num;
}

export function ProfileScreen({
  navigation,
}: {
  navigation: { goBack: () => void };
}) {
  const theme = useTheme();
  const { repositories, refresh } = useData();
  const { requireWriteAccess } = useEntitlement();
  const [nickname, setNickname] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState<GoalType>('unspecified');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [committedPhoto, setCommittedPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        photoRow: {
          alignItems: 'center',
          marginBottom: spacing.lg,
        },
        photo: {
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: theme.thumbnail,
          marginBottom: spacing.sm,
        },
        photoActions: {
          flexDirection: 'row',
          gap: spacing.lg,
        },
        link: {
          ...typography.caption,
          fontWeight: '700',
          color: theme.primary,
        },
        danger: {
          color: theme.danger,
        },
        label: {
          ...typography.caption,
          color: theme.textSecondary,
          marginBottom: spacing.xs,
          marginTop: spacing.sm,
        },
        input: {
          minHeight: 52,
          borderRadius: radii.md,
          backgroundColor: theme.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          paddingHorizontal: spacing.md,
          ...typography.body,
          color: theme.textPrimary,
        },
        goals: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
          marginTop: spacing.xs,
        },
        chip: {
          minHeight: 40,
          paddingHorizontal: spacing.md,
          borderRadius: radii.pill,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          backgroundColor: theme.elevatedSurface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        chipActive: {
          borderColor: theme.primary,
          backgroundColor: theme.surface,
        },
        chipText: {
          ...typography.caption,
          fontWeight: '700',
          color: theme.textPrimary,
        },
        save: { marginTop: spacing.xl },
      }),
    [theme],
  );

  const load = useCallback(async () => {
    if (!repositories) {
      return;
    }
    const profile = await repositories.profile.get();
    setNickname(profile.nickname ?? '');
    setHeight(profile.height == null ? '' : String(profile.height));
    setWeight(profile.weight == null ? '' : String(profile.weight));
    setGoal(profile.goal);
    setPhotoUri(profile.photo);
    setCommittedPhoto(profile.photo);
  }, [repositories]);

  useEffect(() => {
    load();
  }, [load]);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to set a profile photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }
    setPhotoUri(result.assets[0].uri);
  };

  const removePhoto = () => {
    setPhotoUri(null);
  };

  const onSave = async () => {
    if (!requireWriteAccess()) {
      return;
    }
    if (!repositories) {
      return;
    }
    const heightValue = height.trim()
      ? parseOptionalPositive(height)
      : null;
    const weightValue = weight.trim()
      ? parseOptionalPositive(weight)
      : null;
    if (height.trim() && heightValue == null) {
      Alert.alert('Invalid height', 'Enter height in cm greater than zero.');
      return;
    }
    if (weight.trim() && weightValue == null) {
      Alert.alert('Invalid weight', 'Enter weight in kg greater than zero.');
      return;
    }

    setSaving(true);
    try {
      let nextPhoto = committedPhoto;
      if (photoUri && photoUri !== committedPhoto) {
        try {
          nextPhoto = await replacePersistedProfileImage(
            committedPhoto,
            photoUri,
          );
        } catch (error) {
          Alert.alert(
            'Image error',
            error instanceof Error
              ? error.message
              : 'Could not optimize or save photo. Previous photo was kept.',
          );
          setPhotoUri(committedPhoto);
          setSaving(false);
          return;
        }
      } else if (!photoUri && committedPhoto) {
        await deletePersistedProfileImage(committedPhoto);
        nextPhoto = null;
      }

      await repositories.profile.update({
        nickname: nickname.trim() || null,
        height: heightValue,
        weight: weightValue,
        goal: goal === 'unspecified' ? 'maintain' : goal,
        photo: nextPhoto,
      });
      refresh();
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Save failed',
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <FormKeyboardScroll>
        <View style={styles.photoRow}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photo} />
          )}
          <View style={styles.photoActions}>
            <Pressable onPress={pickPhoto}>
              <Text style={styles.link}>
                {photoUri ? 'Change photo' : 'Add photo'}
              </Text>
            </Pressable>
            {photoUri ? (
              <Pressable onPress={removePhoto}>
                <Text style={[styles.link, styles.danger]}>Remove</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <Text style={styles.label}>Nickname</Text>
        <FormTextInput
          value={nickname}
          onChangeText={setNickname}
          style={styles.input}
          placeholder="Optional"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={styles.label}>Height (cm)</Text>
        <FormTextInput
          value={height}
          onChangeText={setHeight}
          style={styles.input}
          keyboardType="numeric"
          placeholder="e.g. 175"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={styles.label}>Weight (kg)</Text>
        <FormTextInput
          value={weight}
          onChangeText={setWeight}
          style={styles.input}
          keyboardType="numeric"
          placeholder="e.g. 70"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={styles.label}>Goal</Text>
        <View style={styles.goals}>
          {GOAL_OPTIONS.map((option) => {
            const active =
              goal === option.value ||
              (goal === 'unspecified' && option.value === 'maintain');
            return (
              <Pressable
                key={option.value}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setGoal(option.value)}
              >
                <Text style={styles.chipText}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <PrimaryButton
          label={saving ? 'Saving…' : 'Save profile'}
          onPress={onSave}
          style={styles.save}
        />
      </FormKeyboardScroll>
    </Screen>
  );
}
