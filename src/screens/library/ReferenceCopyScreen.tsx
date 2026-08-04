import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import {
  getReferenceFoodById,
  scaleReferenceNutrition,
} from '../../data/reference';
import { useEntitlement } from '../../entitlement';
import {
  deletePersistedLibraryImage,
  persistLibraryImage,
} from '../../data/images/libraryImages';
import { canPinAnotherItem } from '../../data/library/pinLimit';
import {
  parseOptionalMacroGrams,
  parsePositiveCalories,
} from '../../data/logging/logMath';
import { LibraryStackParamList } from '../../navigation/types';
import type { LoggingMode } from '../../types';
import { radii } from '../../theme/radii';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<LibraryStackParamList, 'ReferenceCopy'>;

export function ReferenceCopyScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { requireWriteAccess } = useEntitlement();
  const { repositories, refresh } = useData();
  const referenceId = route.params.referenceId;
  const reference = getReferenceFoodById(referenceId);

  const [name, setName] = useState(reference?.displayName ?? '');
  const [grams, setGrams] = useState('100');
  const [calories, setCalories] = useState(
    reference ? String(Math.round(reference.calories)) : '',
  );
  const [protein, setProtein] = useState(
    reference ? String(reference.protein) : '',
  );
  const [carbs, setCarbs] = useState(reference ? String(reference.carbs) : '');
  const [fat, setFat] = useState(reference ? String(reference.fat) : '');
  const [loggingMode, setLoggingMode] = useState<LoggingMode>('portion');
  const [pinned, setPinned] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [manualNutrition, setManualNutrition] = useState(false);
  const didSaveRef = useRef(false);
  const imageUriRef = useRef<string | null>(null);

  useEffect(() => {
    imageUriRef.current = imageUri;
  }, [imageUri]);

  useEffect(() => {
    return () => {
      if (didSaveRef.current) {
        return;
      }
      const draft = imageUriRef.current;
      if (draft) {
        void deletePersistedLibraryImage(draft);
      }
    };
  }, []);

  useEffect(() => {
    navigation.setOptions({ title: 'Copy to My Library' });
  }, [navigation]);

  const applyGrams = (raw: string) => {
    setGrams(raw);
    if (!reference || manualNutrition) {
      return;
    }
    const value = Number.parseFloat(raw);
    if (!Number.isFinite(value) || value <= 0) {
      return;
    }
    const scaled = scaleReferenceNutrition(reference, value);
    setCalories(String(Math.round(scaled.calories)));
    setProtein(String(scaled.protein));
    setCarbs(String(scaled.carbs));
    setFat(String(scaled.fat));
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        hint: {
          ...typography.caption,
          color: theme.textMuted,
          marginBottom: spacing.md,
          lineHeight: 18,
        },
        imageBox: {
          height: 160,
          borderRadius: radii.xl,
          backgroundColor: theme.elevatedSurface,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          marginBottom: spacing.sm,
          ...theme.cardShadow,
        },
        image: { width: '100%', height: '100%' },
        imagePlaceholder: {
          ...typography.body,
          color: theme.textSecondary,
        },
        removeImageText: {
          ...typography.caption,
          color: theme.danger,
          marginBottom: spacing.md,
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
        modeRow: {
          flexDirection: 'row',
          gap: spacing.sm,
          marginTop: spacing.sm,
        },
        modeChip: {
          flex: 1,
          minHeight: 48,
          borderRadius: radii.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.elevatedSurface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
        },
        modeChipActive: {
          borderColor: theme.primary,
          backgroundColor: theme.surface,
        },
        modeText: {
          ...typography.bodyBold,
          color: theme.textPrimary,
        },
        pinRow: {
          marginTop: spacing.lg,
          minHeight: 52,
          borderRadius: radii.md,
          backgroundColor: theme.surface,
          paddingHorizontal: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        pinLabel: {
          ...typography.body,
          color: theme.textPrimary,
        },
        pinValue: {
          ...typography.bodyBold,
          color: theme.primary,
        },
        save: {
          marginTop: spacing.xl,
          marginBottom: spacing.lg,
        },
      }),
    [theme],
  );

  if (!reference) {
    return (
      <Screen>
        <Text style={{ ...typography.body, color: theme.textSecondary }}>
          Reference item not found.
        </Text>
      </Screen>
    );
  }

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to add an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }
    const previousDraft = imageUri;
    try {
      const permanent = await persistLibraryImage(result.assets[0].uri);
      if (previousDraft) {
        await deletePersistedLibraryImage(previousDraft);
      }
      setImageUri(permanent);
    } catch (error) {
      Alert.alert(
        'Image error',
        error instanceof Error ? error.message : 'Could not save image.',
      );
    }
  };

  const onSave = async () => {
    if (!requireWriteAccess()) {
      return;
    }
    if (!repositories) {
      return;
    }
    const trimmedName = name.trim();
    const calorieValue = parsePositiveCalories(calories);
    if (!trimmedName) {
      Alert.alert('Name required', 'Enter an item name.');
      return;
    }
    if (calorieValue == null) {
      Alert.alert('Calories required', 'Enter calories greater than zero.');
      return;
    }
    if (pinned) {
      const allowed = await canPinAnotherItem(repositories);
      if (!allowed) {
        Alert.alert('Pin limit', 'You can pin up to 21 items.');
        return;
      }
    }

    setSaving(true);
    try {
      await repositories.libraryItems.create({
        name: trimmedName,
        calories: calorieValue,
        protein: parseOptionalMacroGrams(protein),
        carbs: parseOptionalMacroGrams(carbs),
        fat: parseOptionalMacroGrams(fat),
        image: imageUri,
        pinned,
        loggingMode,
      });
      didSaveRef.current = true;
      refresh();
      Alert.alert('Added', 'Saved to My Library. You can edit it anytime.');
      navigation.navigate('LibraryHome');
    } catch (error) {
      Alert.alert(
        'Save failed',
        error instanceof Error ? error.message : 'Could not save item',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <FormKeyboardScroll>
        <Text style={styles.hint}>
          Copied from QuickCal Reference (USDA). This becomes your editable
          library item — the reference stays unchanged.
        </Text>

        <Pressable onPress={pickImage} style={styles.imageBox}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={styles.imagePlaceholder}>Add photo (optional)</Text>
          )}
        </Pressable>
        {imageUri ? (
          <Pressable
            onPress={() => {
              void deletePersistedLibraryImage(imageUri);
              setImageUri(null);
            }}
          >
            <Text style={styles.removeImageText}>Remove photo</Text>
          </Pressable>
        ) : null}

        <Text style={styles.label}>Name</Text>
        <FormTextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor={theme.placeholder}
        />

        <Text style={styles.label}>Portion (g)</Text>
        <FormTextInput
          value={grams}
          onChangeText={applyGrams}
          style={styles.input}
          keyboardType="decimal-pad"
          placeholderTextColor={theme.placeholder}
        />
        <Text style={styles.hint}>
          Nutrients scale from the 100 g reference unless you edit them
          manually.
        </Text>

        <Text style={styles.label}>Calories</Text>
        <FormTextInput
          value={calories}
          onChangeText={(value) => {
            setManualNutrition(true);
            setCalories(value);
          }}
          style={styles.input}
          keyboardType="numeric"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={styles.label}>Logging mode</Text>
        <View style={styles.modeRow}>
          <Pressable
            style={[
              styles.modeChip,
              loggingMode === 'quick' && styles.modeChipActive,
            ]}
            onPress={() => setLoggingMode('quick')}
          >
            <Text style={styles.modeText}>Quick Log</Text>
          </Pressable>
          <Pressable
            style={[
              styles.modeChip,
              loggingMode === 'portion' && styles.modeChipActive,
            ]}
            onPress={() => setLoggingMode('portion')}
          >
            <Text style={styles.modeText}>Portion</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Protein (g)</Text>
        <FormTextInput
          value={protein}
          onChangeText={(value) => {
            setManualNutrition(true);
            setProtein(value);
          }}
          style={styles.input}
          keyboardType="numeric"
          placeholderTextColor={theme.placeholder}
        />
        <Text style={styles.label}>Carbs (g)</Text>
        <FormTextInput
          value={carbs}
          onChangeText={(value) => {
            setManualNutrition(true);
            setCarbs(value);
          }}
          style={styles.input}
          keyboardType="numeric"
          placeholderTextColor={theme.placeholder}
        />
        <Text style={styles.label}>Fat (g)</Text>
        <FormTextInput
          value={fat}
          onChangeText={(value) => {
            setManualNutrition(true);
            setFat(value);
          }}
          style={styles.input}
          keyboardType="numeric"
          placeholderTextColor={theme.placeholder}
        />

        <Pressable
          onPress={() => setPinned((value) => !value)}
          style={styles.pinRow}
        >
          <Text style={styles.pinLabel}>
            {pinned ? 'Pinned' : 'Pin to Home'}
          </Text>
          <Text style={styles.pinValue}>{pinned ? 'On' : 'Off'}</Text>
        </Pressable>

        <PrimaryButton
          label={saving ? 'Saving…' : 'Save to My Library'}
          onPress={() => {
            void onSave();
          }}
          style={styles.save}
        />
      </FormKeyboardScroll>
    </Screen>
  );
}
