import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { THEME_LIST } from '../theme/registry';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme, useThemeControls } from '../theme/ThemeProvider';
import type { ThemeId } from '../theme/types';
import { TutorialAnchor } from '../tutorial';

export function ThemePicker() {
  const theme = useTheme();
  const { themeId, setThemeId } = useThemeControls();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        section: {
          marginBottom: spacing.lg,
        },
        heading: {
          ...typography.section,
          color: theme.textPrimary,
          marginBottom: spacing.sm,
        },
        hint: {
          ...typography.caption,
          color: theme.textSecondary,
          marginBottom: spacing.md,
        },
        row: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm + 2,
        },
        swatch: {
          width: '30%',
          minWidth: 96,
          flexGrow: 1,
          borderRadius: radii.md,
          overflow: 'hidden',
          borderWidth: 2,
          borderColor: theme.border,
          backgroundColor: theme.surface,
          ...theme.cardShadow,
        },
        swatchSelected: {
          borderColor: theme.primary,
        },
        preview: {
          height: 44,
          flexDirection: 'row',
        },
        previewBg: {
          flex: 1,
        },
        previewPrimary: {
          width: 18,
        },
        previewAccent: {
          width: 12,
        },
        label: {
          ...typography.micro,
          color: theme.textPrimary,
          fontWeight: '600',
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.sm - 2,
        },
      }),
    [theme],
  );

  return (
    <TutorialAnchor id="settings.theme" style={{ alignSelf: 'stretch' }}>
      <View style={styles.section}>
        <Text style={styles.heading}>Theme</Text>
        <Text style={styles.hint}>Applies across the app immediately</Text>
        <View style={styles.row}>
          {THEME_LIST.map((entry) => {
            const selected = entry.id === themeId;
            return (
              <Pressable
                key={entry.id}
                onPress={() => {
                  void setThemeId(entry.id as ThemeId);
                }}
                style={[styles.swatch, selected && styles.swatchSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${entry.name} theme`}
              >
                <View style={styles.preview}>
                  <View
                    style={[
                      styles.previewBg,
                      { backgroundColor: entry.preview.background },
                    ]}
                  />
                  <View
                    style={[
                      styles.previewPrimary,
                      { backgroundColor: entry.preview.primary },
                    ]}
                  />
                  <View
                    style={[
                      styles.previewAccent,
                      { backgroundColor: entry.preview.accent },
                    ]}
                  />
                </View>
                <Text style={styles.label} numberOfLines={1}>
                  {entry.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </TutorialAnchor>
  );
}
