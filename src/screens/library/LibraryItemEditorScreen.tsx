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
import { TutorialAnchor, useTutorialOptional } from '../../tutorial';
import type { LoggingMode } from '../../types';
import { radii } from '../../theme/radii';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<LibraryStackParamList, 'LibraryItemEditor'>;

export function LibraryItemEditorScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { requireWriteAccess } = useEntitlement();
  const tutorial = useTutorialOptional();
  const itemId = route.params?.itemId;
  const { repositories, refresh } = useData();
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [loggingMode, setLoggingMode] = useState<LoggingMode>('quick');
  const [pinned, setPinned] = useState(false);
  const [wasPinned, setWasPinned] = useState(false);
  const [committedImageUri, setCommittedImageUri] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const didSaveRef = useRef(false);
  const imageUriRef = useRef<string | null>(null);
  const committedRef = useRef<string | null>(null);

  useEffect(() => {
    imageUriRef.current = imageUri;
  }, [imageUri]);

  useEffect(() => {
    committedRef.current = committedImageUri;
  }, [committedImageUri]);

  useEffect(() => {
    return () => {
      if (didSaveRef.current) {
        return;
      }
      const draft = imageUriRef.current;
      const committed = committedRef.current;
      if (draft && draft !== committed) {
        void deletePersistedLibraryImage(draft);
      }
    };
  }, []);

  useEffect(() => {
    if (!repositories || !itemId) {
      return;
    }
    repositories.libraryItems.getById(itemId).then((item) => {
      if (!item) {
        return;
      }
      setName(item.name);
      setCalories(String(item.calories));
      setProtein(item.protein == null ? '' : String(item.protein));
      setCarbs(item.carbs == null ? '' : String(item.carbs));
      setFat(item.fat == null ? '' : String(item.fat));
      setLoggingMode(item.loggingMode);
      setPinned(item.pinned);
      setWasPinned(item.pinned);
      setCommittedImageUri(item.image);
      setImageUri(item.image);
    });
  }, [repositories, itemId]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
        modeHint: {
          ...typography.caption,
          color: theme.textSecondary,
          marginTop: spacing.sm,
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
      if (previousDraft && previousDraft !== committedImageUri) {
        await deletePersistedLibraryImage(previousDraft);
      }
      setImageUri(permanent);
    } catch (error) {
      Alert.alert(
        'Image error',
        error instanceof Error
          ? error.message
          : 'Could not optimize or save image. Previous image was kept.',
      );
    }
  };

  const removeImage = async () => {
    if (imageUri && imageUri !== committedImageUri) {
      await deletePersistedLibraryImage(imageUri);
    }
    setImageUri(null);
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
      Alert.alert('Calories required', 'Enter a calorie amount greater than zero.');
      return;
    }
    if (pinned && !wasPinned) {
      const allowed = await canPinAnotherItem(repositories);
      if (!allowed) {
        Alert.alert('Pin limit', 'You can pin up to 21 items.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: trimmedName,
        calories: calorieValue,
        protein: parseOptionalMacroGrams(protein),
        carbs: parseOptionalMacroGrams(carbs),
        fat: parseOptionalMacroGrams(fat),
        image: imageUri,
        pinned,
        loggingMode,
      };
      if (itemId) {
        await repositories.libraryItems.update(itemId, payload);
      } else {
        await repositories.libraryItems.create(payload);
      }
      if (committedImageUri && committedImageUri !== imageUri) {
        await deletePersistedLibraryImage(committedImageUri);
      }
      didSaveRef.current = true;
      refresh();
      navigation.goBack();
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
        <Pressable onPress={pickImage} style={styles.imageBox}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={styles.imagePlaceholder}>Add photo</Text>
          )}
        </Pressable>
        {imageUri ? (
          <Pressable onPress={removeImage}>
            <Text style={styles.removeImageText}>Remove photo</Text>
          </Pressable>
        ) : null}

        <Text style={styles.label}>Name</Text>
        <FormTextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="Item name"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={styles.label}>Calories</Text>
        <FormTextInput
          value={calories}
          onChangeText={setCalories}
          style={styles.input}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={styles.label}>Logging mode</Text>
        <TutorialAnchor id="library.mode" style={{ alignSelf: 'stretch' }}>
          <View style={styles.modeRow}>
            <Pressable
              style={[
                styles.modeChip,
                loggingMode === 'quick' && styles.modeChipActive,
              ]}
              onPress={() => {
                setLoggingMode('quick');
                tutorial?.notifyAction('selected-logging-mode');
              }}
            >
              <Text style={styles.modeText}>Quick Log</Text>
            </Pressable>
            <Pressable
              style={[
                styles.modeChip,
                loggingMode === 'portion' && styles.modeChipActive,
              ]}
              onPress={() => {
                setLoggingMode('portion');
                tutorial?.notifyAction('selected-logging-mode');
              }}
            >
              <Text style={styles.modeText}>Portion</Text>
            </Pressable>
          </View>
        </TutorialAnchor>
        <Text style={styles.modeHint}>
          {loggingMode === 'quick'
            ? 'One tap logs the saved calories immediately.'
            : 'Tapping asks for a portion before logging.'}
        </Text>

        <Text style={styles.label}>Protein (g, optional)</Text>
        <FormTextInput
          value={protein}
          onChangeText={setProtein}
          style={styles.input}
          keyboardType="numeric"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={styles.label}>Carbs (g, optional)</Text>
        <FormTextInput
          value={carbs}
          onChangeText={setCarbs}
          style={styles.input}
          keyboardType="numeric"
          placeholderTextColor={theme.placeholder}
        />

        <Text style={styles.label}>Fat (g, optional)</Text>
        <FormTextInput
          value={fat}
          onChangeText={setFat}
          style={styles.input}
          keyboardType="numeric"
          placeholderTextColor={theme.placeholder}
        />

        <TutorialAnchor id="library.pin" style={{ alignSelf: 'stretch' }}>
          <Pressable
            onPress={() => setPinned((value) => !value)}
            style={styles.pinRow}
          >
            <Text style={styles.pinLabel}>
              {pinned ? 'Pinned' : 'Pin to Home'}
            </Text>
            <Text style={styles.pinValue}>{pinned ? 'On' : 'Off'}</Text>
          </Pressable>
        </TutorialAnchor>

        <PrimaryButton
          label={saving ? 'Saving…' : itemId ? 'Save' : 'Create'}
          onPress={onSave}
          style={styles.save}
        />
      </FormKeyboardScroll>
    </Screen>
  );
}
