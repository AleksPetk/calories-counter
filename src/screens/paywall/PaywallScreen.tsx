import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { AppBrandLogo } from '../../components/AppBrandLogo';
import { Screen } from '../../components/Screen';
import { appBrand, isLegalUrlConfigured } from '../../config/appBrand';
import { useEntitlement } from '../../entitlement';
import { formatRemainingTrial } from '../../entitlement/formatRemaining';
import { STORE_UNAVAILABLE_MESSAGE } from '../../iap/storeAvailability';
import type { RootStackParamList } from '../../navigation/types';
import { radii } from '../../theme/radii';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

export function PaywallScreen(_props: Props) {
  const theme = useTheme();
  const {
    snapshot,
    product,
    storeAvailable,
    busy,
    lastError,
    purchase,
    restore,
    loadProduct,
    closePaywall,
  } = useEntitlement();
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (storeAvailable) {
        await loadProduct();
      }
      if (!cancelled) {
        setBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadProduct, storeAvailable]);

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
          gap: spacing.sm,
        },
        logoWrap: {
          marginBottom: spacing.xs,
        },
        title: {
          ...typography.title,
          color: theme.textPrimary,
        },
        subtitle: {
          ...typography.body,
          color: theme.textSecondary,
          marginBottom: spacing.sm,
        },
        price: {
          ...typography.title,
          fontSize: 28,
          color: theme.primary,
          marginTop: spacing.sm,
        },
        priceHint: {
          ...typography.caption,
          color: theme.textMuted,
        },
        bullet: {
          ...typography.body,
          color: theme.textPrimary,
        },
        trial: {
          ...typography.bodyBold,
          color: theme.primary,
          marginTop: spacing.md,
        },
        actions: {
          marginTop: spacing.xl,
          gap: spacing.md,
        },
        secondary: {
          alignItems: 'center',
          paddingVertical: spacing.sm,
        },
        secondaryLabel: {
          ...typography.bodyBold,
          color: theme.primary,
        },
        mutedSecondary: {
          ...typography.bodyBold,
          color: theme.textMuted,
        },
        legalRow: {
          flexDirection: 'row',
          justifyContent: 'center',
          gap: spacing.lg,
          marginTop: spacing.lg,
        },
        legal: {
          ...typography.caption,
          color: theme.textMuted,
        },
        legalDisabled: {
          opacity: 0.45,
        },
        error: {
          ...typography.caption,
          color: theme.danger,
          marginTop: spacing.sm,
        },
        note: {
          ...typography.caption,
          color: theme.textMuted,
          marginTop: spacing.md,
          textAlign: 'center',
        },
      }),
    [theme],
  );

  const trialActive = snapshot?.accessState === 'trial_active';
  const purchased = snapshot?.accessState === 'purchased';
  const priceLabel = product?.displayPrice;
  const busyNow = busy === 'purchasing' || busy === 'restoring';

  const dismiss = useCallback(() => {
    // Single dismiss path — never call goBack() a second time.
    closePaywall();
  }, [closePaywall]);

  const onPurchase = useCallback(async () => {
    if (!storeAvailable) {
      Alert.alert('Store unavailable', STORE_UNAVAILABLE_MESSAGE);
      return;
    }
    const result = await purchase();
    if (result === 'success') {
      Alert.alert('Unlocked', 'Lifetime access is active on this device.');
      dismiss();
      return;
    }
    if (result === 'cancelled') {
      return;
    }
    if (result === 'pending') {
      Alert.alert(
        'Purchase pending',
        'The store has not confirmed payment yet. Access unlocks after confirmation.',
      );
      return;
    }
    if (result === 'unavailable') {
      // Expected in Expo Go — not a purchase failure; stay on paywall.
      Alert.alert(
        'Store unavailable',
        lastError ?? STORE_UNAVAILABLE_MESSAGE,
      );
      return;
    }
    Alert.alert('Purchase failed', lastError ?? 'Please try again.');
  }, [storeAvailable, purchase, dismiss, lastError]);

  const onRestore = useCallback(async () => {
    if (!storeAvailable) {
      Alert.alert('Store unavailable', STORE_UNAVAILABLE_MESSAGE);
      return;
    }
    const result = await restore();
    if (result === 'restored') {
      Alert.alert('Restored', 'Your lifetime purchase was restored.');
      dismiss();
      return;
    }
    if (result === 'none') {
      Alert.alert(
        'Nothing to restore',
        'No lifetime purchase was found for this store account on this platform.',
      );
      return;
    }
    if (result === 'unavailable') {
      Alert.alert('Store unavailable', STORE_UNAVAILABLE_MESSAGE);
      return;
    }
    Alert.alert('Restore failed', lastError ?? 'Please try again.');
  }, [storeAvailable, restore, dismiss, lastError]);

  return (
    <Screen>
      <View style={styles.card}>
        <View style={styles.logoWrap}>
          <AppBrandLogo variant="wordmark" height={26} />
        </View>
        <Text style={styles.title}>Lifetime Access</Text>
        <Text style={styles.subtitle}>
          One-time purchase. No subscription.
        </Text>
        <Text style={styles.bullet}>• Unlimited logging after unlock</Text>
        <Text style={styles.bullet}>• Keep all local data you already created</Text>
        <Text style={styles.bullet}>• Restore on this platform anytime</Text>

        {bootstrapping ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 12 }} />
        ) : priceLabel ? (
          <>
            <Text style={styles.price}>{priceLabel}</Text>
            <Text style={styles.priceHint}>
              Price from the App Store / Google Play
            </Text>
          </>
        ) : (
          <Text style={styles.priceHint}>
            {storeAvailable
              ? 'Price unavailable — confirm the product exists in App Store Connect / Play Console.'
              : STORE_UNAVAILABLE_MESSAGE}
          </Text>
        )}

        {trialActive ? (
          <Text style={styles.trial}>
            Trial: {formatRemainingTrial(snapshot?.remainingMs ?? null)}
          </Text>
        ) : null}

        {purchased ? (
          <Text style={styles.trial}>
            {snapshot?.isSimulatedPurchase
              ? 'Purchased (simulated · DEV)'
              : 'Lifetime unlocked'}
          </Text>
        ) : null}

        {lastError && storeAvailable ? (
          <Text style={styles.error}>{lastError}</Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        {!purchased ? (
          <PrimaryButton
            label={
              !storeAvailable
                ? 'Purchase (store build required)'
                : busy === 'purchasing'
                  ? 'Purchasing…'
                  : 'Purchase'
            }
            onPress={() => {
              if (busyNow) {
                return;
              }
              void onPurchase();
            }}
          />
        ) : null}

        <Pressable
          style={styles.secondary}
          disabled={busyNow}
          onPress={() => {
            void onRestore();
          }}
        >
          <Text style={styles.secondaryLabel}>
            {busy === 'restoring'
              ? 'Restoring…'
              : !storeAvailable
                ? 'Restore (store build required)'
                : 'Restore Purchase'}
          </Text>
        </Pressable>

        {trialActive ? (
          <Pressable style={styles.secondary} onPress={dismiss}>
            <Text style={styles.secondaryLabel}>Continue Trial</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.secondary} onPress={dismiss}>
            <Text style={styles.mutedSecondary}>Close</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.legalRow}>
        <Text
          style={[
            styles.legal,
            !isLegalUrlConfigured(appBrand.privacyPolicyUrl) &&
              styles.legalDisabled,
          ]}
        >
          Privacy Policy
        </Text>
        <Text
          style={[
            styles.legal,
            !isLegalUrlConfigured(appBrand.termsUrl) && styles.legalDisabled,
          ]}
        >
          Terms of Use
        </Text>
      </View>
      <Text style={styles.note}>
        Legal links enable when docs.alekspetk.com URLs are configured.
      </Text>
    </Screen>
  );
}
