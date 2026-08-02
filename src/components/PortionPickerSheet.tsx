import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { LibraryItem } from '../types';
import {
  calculateItemNutrition,
  parsePositivePortion,
} from '../data/logging/logMath';
import { PrimaryButton } from './PrimaryButton';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';

const PRESETS = [1, 1.5, 2] as const;
/** Delay so the opening tap cannot immediately hit Confirm / Custom. */
const INTERACTION_READY_MS = 320;

type PortionPickerSheetProps = {
  visible: boolean;
  item: LibraryItem | null;
  onCancel: () => void;
  onConfirm: (portion: number) => void;
  confirming?: boolean;
};

/**
 * Bottom sheet for portion logging.
 * Intentionally does NOT use FormKeyboardScroll: that helper is flex:1
 * full-screen layout and collapses to an empty panel inside a maxHeight sheet.
 */
export function PortionPickerSheet({
  visible,
  item,
  onCancel,
  onConfirm,
  confirming = false,
}: PortionPickerSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const customInputRef = useRef<TextInput>(null);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(1);
  const [custom, setCustom] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [interactionsReady, setInteractionsReady] = useState(false);

  useEffect(() => {
    if (!visible) {
      setInteractionsReady(false);
      return;
    }
    setSelectedPreset(1);
    setCustom('');
    setCustomMode(false);
    setInteractionsReady(false);
    const timer = setTimeout(() => {
      setInteractionsReady(true);
    }, INTERACTION_READY_MS);
    return () => clearTimeout(timer);
  }, [visible, item?.id]);

  const portion =
    customMode || selectedPreset == null
      ? parsePositivePortion(custom)
      : selectedPreset;

  const nutrition =
    item && portion != null ? calculateItemNutrition(item, portion) : null;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          justifyContent: 'flex-end',
        },
        backdrop: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0,0,0,0.4)',
        },
        avoider: {
          width: '100%',
          maxHeight: '88%',
        },
        sheet: {
          backgroundColor: theme.surface,
          borderTopLeftRadius: radii.xl,
          borderTopRightRadius: radii.xl,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          paddingTop: spacing.lg,
          paddingHorizontal: spacing.lg,
          paddingBottom: Math.max(insets.bottom, spacing.md),
          // Height comes from content — do not use flex:1 children here.
        },
        scroll: {
          flexGrow: 0,
        },
        scrollContent: {
          paddingBottom: spacing.sm,
        },
        title: {
          ...typography.section,
          color: theme.textPrimary,
        },
        subtitle: {
          ...typography.caption,
          color: theme.textSecondary,
          marginTop: 4,
          marginBottom: spacing.md,
        },
        presets: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
          marginBottom: spacing.md,
        },
        preset: {
          minWidth: '22%',
          flexGrow: 1,
          minHeight: 48,
          borderRadius: radii.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.elevatedSurface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          paddingHorizontal: spacing.sm,
        },
        presetActive: {
          borderColor: theme.primary,
          backgroundColor: theme.surface,
        },
        presetText: {
          ...typography.bodyBold,
          color: theme.textPrimary,
        },
        label: {
          ...typography.caption,
          color: theme.textSecondary,
          marginBottom: spacing.xs,
        },
        input: {
          minHeight: 48,
          borderRadius: radii.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          paddingHorizontal: spacing.md,
          ...typography.body,
          color: theme.textPrimary,
          backgroundColor: theme.inputBackground,
          marginBottom: spacing.md,
        },
        calories: {
          ...typography.bodyBold,
          color: theme.primary,
          marginBottom: spacing.lg,
        },
        actions: {
          flexDirection: 'row',
          gap: spacing.sm,
          marginBottom: spacing.sm,
        },
        cancel: {
          flex: 1,
          minHeight: 52,
          borderRadius: radii.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.elevatedSurface,
        },
        cancelText: {
          ...typography.bodyBold,
          color: theme.textPrimary,
        },
        confirm: {
          flex: 1,
        },
      }),
    [theme, insets.bottom],
  );

  const handleCancel = () => {
    Keyboard.dismiss();
    onCancel();
  };

  const handleConfirm = () => {
    if (!interactionsReady || portion == null || confirming) {
      return;
    }
    Keyboard.dismiss();
    onConfirm(portion);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={handleCancel}
          accessibilityRole="button"
          accessibilityLabel="Close portion sheet"
        />
        <KeyboardAvoidingView
          style={styles.avoider}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <View style={styles.sheet}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={
                Platform.OS === 'ios' ? 'interactive' : 'on-drag'
              }
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Text style={styles.title}>{item?.name ?? 'Portion'}</Text>
              <Text style={styles.subtitle}>Choose a portion multiplier</Text>

              <View style={styles.presets}>
                {PRESETS.map((value) => {
                  const active = !customMode && selectedPreset === value;
                  return (
                    <Pressable
                      key={value}
                      disabled={!interactionsReady}
                      style={[styles.preset, active && styles.presetActive]}
                      onPress={() => {
                        setCustomMode(false);
                        setSelectedPreset(value);
                        setCustom('');
                        Keyboard.dismiss();
                      }}
                    >
                      <Text style={styles.presetText}>{value}</Text>
                    </Pressable>
                  );
                })}
                <Pressable
                  disabled={!interactionsReady}
                  style={[styles.preset, customMode && styles.presetActive]}
                  onPress={() => {
                    setCustomMode(true);
                    setSelectedPreset(null);
                    requestAnimationFrame(() => {
                      customInputRef.current?.focus();
                    });
                  }}
                >
                  <Text style={styles.presetText}>Custom</Text>
                </Pressable>
              </View>

              {customMode ? (
                <>
                  <Text style={styles.label}>Custom portion</Text>
                  <TextInput
                    ref={customInputRef}
                    value={custom}
                    onChangeText={(text) => {
                      setCustom(text);
                      setCustomMode(true);
                      setSelectedPreset(null);
                    }}
                    keyboardType="decimal-pad"
                    placeholder="e.g. 1.25"
                    placeholderTextColor={theme.placeholder}
                    style={styles.input}
                    editable={interactionsReady}
                  />
                </>
              ) : null}

              <Text style={styles.calories}>
                {nutrition
                  ? `${Math.round(nutrition.calories)} kcal`
                  : customMode
                    ? 'Enter a valid portion'
                    : `${item ? Math.round(item.calories * (selectedPreset ?? 1)) : 0} kcal`}
              </Text>

              <View style={styles.actions}>
                <Pressable style={styles.cancel} onPress={handleCancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <PrimaryButton
                  label={confirming ? 'Logging…' : 'Confirm'}
                  style={styles.confirm}
                  onPress={handleConfirm}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
