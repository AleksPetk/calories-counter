import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppBrandLogo } from '../../components/AppBrandLogo';
import { Screen } from '../../components/Screen';
import { appBrand, getSupportMailtoUrl } from '../../config/appBrand';
import { radii } from '../../theme/radii';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeProvider';
import { openExternalUrl } from '../../utils/openExternalUrl';

export function AppInformationScreen() {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: theme.surface,
          borderRadius: radii.xl,
          padding: spacing.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          ...theme.softShadow,
        },
        logoWrap: {
          marginBottom: spacing.md,
        },
        name: {
          ...typography.title,
          color: theme.textPrimary,
        },
        subtitle: {
          ...typography.body,
          color: theme.textSecondary,
          marginTop: spacing.xs,
        },
        version: {
          ...typography.caption,
          color: theme.textMuted,
          marginTop: spacing.md,
        },
        link: {
          ...typography.bodyBold,
          color: theme.primary,
          marginTop: spacing.lg,
        },
        hint: {
          ...typography.caption,
          color: theme.textMuted,
          marginTop: spacing.xs,
        },
      }),
    [theme],
  );

  return (
    <Screen>
      <View style={styles.card}>
        <View style={styles.logoWrap}>
          <AppBrandLogo variant="wordmark" height={30} />
        </View>
        <Text style={styles.name}>{appBrand.appName}</Text>
        <Text style={styles.subtitle}>{appBrand.appSubtitle}</Text>
        <Text style={styles.version}>Version {appBrand.version}</Text>

        <Pressable
          onPress={() => {
            void openExternalUrl(appBrand.privacyPolicyUrl, 'Privacy Policy');
          }}
          accessibilityRole="link"
          accessibilityLabel="Privacy Policy"
        >
          <Text style={styles.link}>Privacy Policy</Text>
          <Text style={styles.hint}>{appBrand.privacyPolicyUrl}</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            void openExternalUrl(appBrand.termsUrl, 'Terms of Use');
          }}
          accessibilityRole="link"
          accessibilityLabel="Terms of Use"
        >
          <Text style={styles.link}>Terms of Use</Text>
          <Text style={styles.hint}>{appBrand.termsUrl}</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            void openExternalUrl(appBrand.supportUrl, 'Support');
          }}
          accessibilityRole="link"
          accessibilityLabel="Support"
        >
          <Text style={styles.link}>Support</Text>
          <Text style={styles.hint}>{appBrand.supportUrl}</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            void openExternalUrl(getSupportMailtoUrl(), 'Contact Support');
          }}
          accessibilityRole="link"
          accessibilityLabel="Contact Support"
        >
          <Text style={styles.link}>Contact Support</Text>
          <Text style={styles.hint}>{appBrand.contactEmail}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
