import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppBrandLogo } from '../components/AppBrandLogo';
import { THEME_LIST } from '../theme/registry';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';

type IonName = ComponentProps<typeof Ionicons>['name'];

export type OnboardingPageId =
  | 'welcome'
  | 'logging'
  | 'library'
  | 'themes'
  | 'privacy'
  | 'trial';

export type OnboardingPage = {
  id: OnboardingPageId;
  title: string;
  subtitle?: string;
  Content: () => React.JSX.Element;
};

function IconBadge({ name }: { name: IonName }) {
  const theme = useTheme();
  return (
    <View
      style={{
        width: 88,
        height: 88,
        borderRadius: radii.xl,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.elevatedSurface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.border,
        marginBottom: spacing.xl,
        ...theme.softShadow,
      }}
    >
      <Ionicons name={name} size={40} color={theme.primary} />
    </View>
  );
}

function Bullet({ children }: { children: string }) {
  const theme = useTheme();
  return (
    <Text
      style={{
        ...typography.body,
        color: theme.textSecondary,
        lineHeight: 24,
      }}
    >
      {`•  ${children}`}
    </Text>
  );
}

function ModeCard({
  title,
  lines,
  recommended,
}: {
  title: string;
  lines: string[];
  recommended?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        minWidth: '42%',
        borderRadius: radii.lg,
        padding: spacing.md,
        backgroundColor: theme.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: recommended ? theme.primary : theme.border,
        gap: spacing.xs,
        ...theme.cardShadow,
      }}
    >
      <Text style={{ ...typography.bodyBold, color: theme.textPrimary }}>
        {title}
      </Text>
      {lines.map((line) => (
        <Text
          key={line}
          style={{ ...typography.caption, color: theme.textSecondary }}
        >
          {line}
        </Text>
      ))}
      {recommended ? (
        <Text
          style={{
            ...typography.micro,
            color: theme.primary,
            fontWeight: '700',
            marginTop: spacing.xs,
          }}
        >
          Recommended
        </Text>
      ) : null}
    </View>
  );
}

function ThemePreviewStrip() {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.md,
        justifyContent: 'center',
      }}
    >
      {THEME_LIST.map((entry) => (
        <View
          key={entry.id}
          style={{
            width: 54,
            borderRadius: radii.sm,
            overflow: 'hidden',
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: theme.border,
          }}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <View style={{ height: 28, flexDirection: 'row' }}>
            <View
              style={{ flex: 1, backgroundColor: entry.preview.background }}
            />
            <View
              style={{ width: 10, backgroundColor: entry.preview.primary }}
            />
            <View
              style={{ width: 7, backgroundColor: entry.preview.accent }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

function WelcomeContent() {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'center' }}>
      <AppBrandLogo variant="wordmark" height={44} />
      <Text
        style={{
          ...typography.body,
          color: theme.textSecondary,
          textAlign: 'center',
          marginTop: spacing.xl,
          maxWidth: 280,
          lineHeight: 24,
        }}
      >
        Log meals in seconds. Your foods stay on this device — no account, no
        cloud, no clutter.
      </Text>
    </View>
  );
}

function LoggingContent() {
  const theme = useTheme();
  return (
    <View style={{ width: '100%', gap: spacing.lg }}>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <ModeCard
          title="Quick Log"
          lines={['Best for fixed meals.', 'One tap.']}
          recommended
        />
        <ModeCard
          title="Portion"
          lines={['When amounts change.', 'Choose 1, 1.5, 2 or Custom.']}
        />
      </View>
      <Text
        style={{
          ...typography.caption,
          color: theme.textMuted,
          textAlign: 'center',
        }}
      >
        Quick Log is usually best for speed.
      </Text>
    </View>
  );
}

function LibraryContent() {
  return (
    <View style={{ alignItems: 'center', width: '100%' }}>
      <IconBadge name="bookmark-outline" />
      <View style={{ alignSelf: 'stretch', gap: spacing.sm }}>
        <Bullet>Build your own library.</Bullet>
        <Bullet>No huge online food database.</Bullet>
        <Bullet>Your foods stay on your device.</Bullet>
        <Bullet>Pin favorites for even faster logging.</Bullet>
      </View>
    </View>
  );
}

function ThemesContent() {
  return (
    <View style={{ alignItems: 'center', width: '100%' }}>
      <IconBadge name="color-palette-outline" />
      <View style={{ alignSelf: 'stretch', gap: spacing.sm }}>
        <Bullet>Multiple beautiful themes.</Bullet>
        <Bullet>Change anytime from Settings.</Bullet>
      </View>
      <ThemePreviewStrip />
    </View>
  );
}

function PrivacyContent() {
  return (
    <View style={{ alignItems: 'center', width: '100%' }}>
      <IconBadge name="shield-checkmark-outline" />
      <View style={{ alignSelf: 'stretch', gap: spacing.sm }}>
        <Bullet>Everything stays on your device.</Bullet>
        <Bullet>No account required.</Bullet>
        <Bullet>No ads.</Bullet>
        <Bullet>No subscriptions.</Bullet>
        <Bullet>Local SQLite storage.</Bullet>
      </View>
    </View>
  );
}

function TrialContent() {
  return (
    <View style={{ alignItems: 'center', width: '100%' }}>
      <IconBadge name="diamond-outline" />
      <View style={{ alignSelf: 'stretch', gap: spacing.sm }}>
        <Bullet>14-day free trial.</Bullet>
        <Bullet>One-time lifetime purchase.</Bullet>
        <Bullet>No subscription.</Bullet>
        <Bullet>Purchases can be restored.</Bullet>
      </View>
    </View>
  );
}

export const ONBOARDING_PAGES: OnboardingPage[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    subtitle: 'The fastest offline calorie tracker.',
    Content: WelcomeContent,
  },
  {
    id: 'logging',
    title: 'Quick Log vs Portion',
    subtitle: 'Two ways to log. Pick what fits the meal.',
    Content: LoggingContent,
  },
  {
    id: 'library',
    title: 'Your Personal Library',
    subtitle: 'Build it once. Log forever.',
    Content: LibraryContent,
  },
  {
    id: 'themes',
    title: 'Themes',
    subtitle: 'Make QuickCal feel like yours.',
    Content: ThemesContent,
  },
  {
    id: 'privacy',
    title: 'Privacy & Offline',
    subtitle: 'Built to stay private by design.',
    Content: PrivacyContent,
  },
  {
    id: 'trial',
    title: 'Trial & Lifetime',
    subtitle: 'Try it free. Keep it forever.',
    Content: TrialContent,
  },
];
