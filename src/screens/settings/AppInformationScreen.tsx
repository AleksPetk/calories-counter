import { useMemo } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppBrandLogo } from '../../components/AppBrandLogo';
import { Screen } from '../../components/Screen';
import { appBrand, isLegalUrlConfigured } from '../../config/appBrand';
import { radii } from '../../theme/radii';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeProvider';

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
        linkDisabled: {
          ...typography.bodyBold,
          color: theme.textMuted,
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

  const openConfiguredUrl = async (url: string, label: string) => {
    if (!isLegalUrlConfigured(url)) {
      Alert.alert(
        'Coming soon',
        `${label} will open when a docs.alekspetk.com URL is configured.`,
      );
      return;
    }
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open link', url);
    }
  };

  const privacyReady = isLegalUrlConfigured(appBrand.privacyPolicyUrl);
  const termsReady = isLegalUrlConfigured(appBrand.termsUrl);
  const contactReady = appBrand.contactEmail.trim().length > 0;

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
          onPress={() =>
            openConfiguredUrl(appBrand.privacyPolicyUrl, 'Privacy Policy')
          }
        >
          <Text style={privacyReady ? styles.link : styles.linkDisabled}>
            Privacy Policy
          </Text>
          <Text style={styles.hint}>
            {privacyReady ? appBrand.privacyPolicyUrl : 'URL not configured yet'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => openConfiguredUrl(appBrand.termsUrl, 'Terms of Use')}
        >
          <Text style={termsReady ? styles.link : styles.linkDisabled}>
            Terms of Use
          </Text>
          <Text style={styles.hint}>
            {termsReady ? appBrand.termsUrl : 'URL not configured yet'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            if (!contactReady) {
              Alert.alert(
                'Coming soon',
                'Contact email will be available when configured.',
              );
              return;
            }
            void Linking.openURL(`mailto:${appBrand.contactEmail}`);
          }}
        >
          <Text style={contactReady ? styles.link : styles.linkDisabled}>
            Contact
          </Text>
          <Text style={styles.hint}>
            {contactReady ? appBrand.contactEmail : 'Email not configured yet'}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
