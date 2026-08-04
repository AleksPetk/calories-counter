import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  REFERENCE_CATEGORIES,
  REFERENCE_CATEGORY_LABELS,
  type ReferenceCategory,
} from '../data/reference';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';

export type ReferenceCategorySelection = ReferenceCategory | null;

type ReferenceCategoryPickerProps = {
  visible: boolean;
  selected: ReferenceCategorySelection;
  onSelect: (next: ReferenceCategorySelection) => void;
  onClose: () => void;
};

export function referenceCategoryLabel(
  selected: ReferenceCategorySelection,
): string {
  if (selected == null) {
    return 'All';
  }
  return REFERENCE_CATEGORY_LABELS[selected];
}

const OPTIONS: { id: ReferenceCategorySelection; label: string }[] = [
  { id: null, label: 'All categories' },
  ...REFERENCE_CATEGORIES.map((id) => ({
    id,
    label: REFERENCE_CATEGORY_LABELS[id],
  })),
];

export function ReferenceCategoryPicker({
  visible,
  selected,
  onSelect,
  onClose,
}: ReferenceCategoryPickerProps) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          justifyContent: 'flex-end',
        },
        backdrop: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0,0,0,0.35)',
        },
        sheet: {
          backgroundColor: theme.surface,
          borderTopLeftRadius: radii.xl,
          borderTopRightRadius: radii.xl,
          paddingTop: spacing.md,
          paddingBottom: spacing.xxl,
          maxHeight: '70%',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          ...theme.softShadow,
        },
        title: {
          ...typography.bodyBold,
          color: theme.textPrimary,
          paddingHorizontal: spacing.lg,
          marginBottom: spacing.sm,
        },
        row: {
          minHeight: 52,
          paddingHorizontal: spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.border,
        },
        rowPressed: {
          backgroundColor: theme.elevatedSurface,
        },
        rowLabel: {
          ...typography.body,
          color: theme.textPrimary,
          flexShrink: 1,
          paddingRight: spacing.md,
        },
        rowLabelActive: {
          color: theme.primary,
          fontWeight: '700',
        },
      }),
    [theme],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close category picker"
        />
        <View style={styles.sheet}>
          <Text style={styles.title}>Category</Text>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {OPTIONS.map((option) => {
              const active = option.id === selected;
              return (
                <Pressable
                  key={option.label}
                  onPress={() => {
                    onSelect(option.id);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.rowPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={option.label}
                >
                  <Text
                    style={[
                      styles.rowLabel,
                      active && styles.rowLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {active ? (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={theme.primary}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
