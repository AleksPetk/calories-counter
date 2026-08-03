import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components/PrimaryButton';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';
import { ONBOARDING_PAGES } from './pages';

type OnboardingModalProps = {
  visible: boolean;
  onFinished: () => void;
};

export function OnboardingModal({ visible, onFinished }: OnboardingModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const pages = ONBOARDING_PAGES;
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(
    Dimensions.get('window').width,
  );

  const isLast = index >= pages.length - 1;

  useEffect(() => {
    if (!visible) {
      return;
    }
    setIndex(0);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: 0, animated: false });
    });
  }, [visible]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          backgroundColor: theme.background,
          paddingTop: Math.max(insets.top, spacing.md),
          paddingBottom: Math.max(insets.bottom, spacing.md),
        },
        topBar: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          paddingHorizontal: spacing.lg,
          minHeight: 36,
        },
        skip: {
          ...typography.bodyBold,
          color: theme.textMuted,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.sm,
        },
        pager: {
          flex: 1,
        },
        page: {
          flex: 1,
          paddingHorizontal: spacing.lg,
          justifyContent: 'center',
        },
        pageInner: {
          alignItems: 'center',
          gap: spacing.md,
          paddingBottom: spacing.xl,
        },
        title: {
          ...typography.title,
          color: theme.textPrimary,
          textAlign: 'center',
        },
        subtitle: {
          ...typography.body,
          color: theme.textSecondary,
          textAlign: 'center',
          marginBottom: spacing.md,
          maxWidth: 320,
        },
        footer: {
          paddingHorizontal: spacing.lg,
          gap: spacing.md,
        },
        dots: {
          flexDirection: 'row',
          justifyContent: 'center',
          gap: spacing.sm,
          paddingVertical: spacing.sm,
        },
        dot: {
          width: 8,
          height: 8,
          borderRadius: radii.pill,
          backgroundColor: theme.border,
        },
        dotActive: {
          width: 22,
          backgroundColor: theme.primary,
        },
        navRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        },
        secondaryBtn: {
          flex: 1,
          minHeight: 52,
          borderRadius: radii.md,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          backgroundColor: theme.surface,
        },
        secondaryLabel: {
          ...typography.bodyBold,
          color: theme.textPrimary,
        },
        primaryWrap: {
          flex: 1.4,
        },
        fullPrimary: {
          alignSelf: 'stretch',
        },
      }),
    [theme, insets.top, insets.bottom],
  );

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(pages.length - 1, next));
      setIndex(clamped);
      scrollRef.current?.scrollTo({
        x: clamped * pageWidth,
        animated: true,
      });
    },
    [pageWidth, pages.length],
  );

  const onScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
      setIndex(Math.max(0, Math.min(pages.length - 1, next)));
    },
    [pageWidth, pages.length],
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onFinished}
    >
      <View
        style={styles.root}
        onLayout={(event) => {
          const width = event.nativeEvent.layout.width;
          if (width > 0 && width !== pageWidth) {
            setPageWidth(width);
          }
        }}
      >
        <View style={styles.topBar}>
          {!isLast ? (
            <Pressable
              onPress={onFinished}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Skip onboarding"
            >
              <Text style={styles.skip}>Skip</Text>
            </Pressable>
          ) : (
            <View />
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          scrollEventThrottle={16}
          style={styles.pager}
          keyboardShouldPersistTaps="handled"
        >
          {pages.map((page) => (
            <View key={page.id} style={[styles.page, { width: pageWidth }]}>
              <View style={styles.pageInner}>
                <Text style={styles.title}>{page.title}</Text>
                {page.subtitle ? (
                  <Text style={styles.subtitle}>{page.subtitle}</Text>
                ) : null}
                <page.Content />
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {pages.map((page, i) => (
              <View
                key={page.id}
                style={[styles.dot, i === index && styles.dotActive]}
              />
            ))}
          </View>

          {isLast ? (
            <PrimaryButton
              label="Start Using QuickCal"
              onPress={onFinished}
              style={styles.fullPrimary}
            />
          ) : (
            <View style={styles.navRow}>
              <Pressable
                onPress={() => goTo(index - 1)}
                disabled={index === 0}
                style={[
                  styles.secondaryBtn,
                  index === 0 && { opacity: 0.35 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Previous"
              >
                <Text style={styles.secondaryLabel}>Previous</Text>
              </Pressable>
              <PrimaryButton
                label="Next"
                onPress={() => goTo(index + 1)}
                style={styles.primaryWrap}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
