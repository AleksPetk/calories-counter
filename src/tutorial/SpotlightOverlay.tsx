import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components/PrimaryButton';
import { AppBrandLogo } from '../components/AppBrandLogo';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';
import type { AnchorRect, TutorialStep } from './types';

type SpotlightOverlayProps = {
  step: TutorialStep;
  stepIndex: number;
  stepCount: number;
  hole: AnchorRect | null;
  onNext: () => void;
  onSkip: () => void;
};

const HOLE_PAD = 8;
const EDGE_GAP = spacing.md;
const HOLE_GAP = spacing.md;

export function SpotlightOverlay({
  step,
  stepIndex,
  stepCount,
  hole,
  onNext,
  onSkip,
}: SpotlightOverlayProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [cardHeight, setCardHeight] = useState(0);

  useEffect(() => {
    setCardHeight(0);
  }, [stepIndex, step.id]);

  const safeTop = insets.top + EDGE_GAP;
  const safeBottom = windowHeight - insets.bottom - EDGE_GAP;
  const safeHeight = Math.max(120, safeBottom - safeTop);

  const onCardLayout = useCallback((event: LayoutChangeEvent) => {
    const next = Math.ceil(event.nativeEvent.layout.height);
    setCardHeight((prev) => (Math.abs(prev - next) > 1 ? next : prev));
  }, []);

  const { tooltipTop, tooltipMaxHeight } = useMemo(() => {
    const measured = cardHeight > 0 ? cardHeight : Math.min(260, safeHeight);

    if (!hole) {
      const maxH = Math.min(measured, safeHeight);
      const ideal = windowHeight * 0.2;
      const top = Math.min(
        Math.max(safeTop, ideal),
        safeBottom - Math.min(maxH, safeHeight * 0.85),
      );
      return {
        tooltipTop: top,
        tooltipMaxHeight: Math.max(140, safeBottom - top),
      };
    }

    const holeBottom = hole.y + hole.height + HOLE_PAD;
    const holeTop = hole.y - HOLE_PAD;
    const spaceBelow = safeBottom - (holeBottom + HOLE_GAP);
    const spaceAbove = holeTop - HOLE_GAP - safeTop;
    const need = Math.min(measured, 200);

    const placeBelow = () => {
      const top = Math.max(safeTop, holeBottom + HOLE_GAP);
      const maxH = Math.max(140, safeBottom - top);
      return { tooltipTop: top, tooltipMaxHeight: maxH };
    };

    const placeAbove = () => {
      const maxH = Math.max(140, spaceAbove);
      const height = Math.min(measured, maxH);
      const top = Math.max(safeTop, holeTop - HOLE_GAP - height);
      return {
        tooltipTop: top,
        tooltipMaxHeight: Math.max(140, holeTop - HOLE_GAP - top),
      };
    };

    if (spaceBelow >= need && spaceBelow >= spaceAbove) {
      return placeBelow();
    }
    if (spaceAbove >= need) {
      return placeAbove();
    }
    if (spaceBelow >= spaceAbove && spaceBelow >= 140) {
      return placeBelow();
    }
    if (spaceAbove >= 140) {
      return placeAbove();
    }
    if (spaceBelow >= spaceAbove) {
      return placeBelow();
    }
    return {
      tooltipTop: safeTop,
      tooltipMaxHeight: safeHeight,
    };
  }, [hole, cardHeight, safeTop, safeBottom, safeHeight, windowHeight]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          ...StyleSheet.absoluteFillObject,
          zIndex: 1000,
        },
        dim: {
          backgroundColor: 'rgba(0,0,0,0.55)',
        },
        tooltip: {
          position: 'absolute',
          left: spacing.lg,
          right: spacing.lg,
          backgroundColor: theme.surface,
          borderRadius: radii.xl,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          overflow: 'hidden',
          ...theme.softShadow,
        },
        scroll: {
          flexGrow: 0,
        },
        progress: {
          ...typography.micro,
          color: theme.textMuted,
          marginBottom: spacing.xs,
        },
        logoWrap: {
          marginBottom: spacing.sm,
        },
        title: {
          ...typography.section,
          color: theme.textPrimary,
          marginBottom: spacing.xs,
        },
        body: {
          ...typography.body,
          color: theme.textSecondary,
          lineHeight: 22,
          marginBottom: spacing.sm,
        },
        actions: {
          gap: spacing.sm,
          paddingTop: spacing.xs,
        },
        skip: {
          alignSelf: 'center',
          paddingVertical: spacing.sm,
        },
        skipText: {
          ...typography.caption,
          fontWeight: '700',
          color: theme.textMuted,
        },
        holeBorder: {
          position: 'absolute',
          borderRadius: radii.md,
          borderWidth: 2,
          borderColor: theme.primary,
        },
      }),
    [theme],
  );

  const panes = useMemo(() => {
    if (!hole) {
      return [
        {
          key: 'full',
          style: [
            styles.dim,
            {
              position: 'absolute' as const,
              left: 0,
              top: 0,
              width: windowWidth,
              height: windowHeight,
            },
          ],
        },
      ];
    }

    const x = Math.max(0, hole.x - HOLE_PAD);
    const y = Math.max(0, hole.y - HOLE_PAD);
    const w = hole.width + HOLE_PAD * 2;
    const h = hole.height + HOLE_PAD * 2;

    return [
      {
        key: 'top',
        style: [
          styles.dim,
          {
            position: 'absolute' as const,
            left: 0,
            top: 0,
            width: windowWidth,
            height: y,
          },
        ],
      },
      {
        key: 'left',
        style: [
          styles.dim,
          {
            position: 'absolute' as const,
            left: 0,
            top: y,
            width: x,
            height: h,
          },
        ],
      },
      {
        key: 'right',
        style: [
          styles.dim,
          {
            position: 'absolute' as const,
            left: x + w,
            top: y,
            width: Math.max(0, windowWidth - (x + w)),
            height: h,
          },
        ],
      },
      {
        key: 'bottom',
        style: [
          styles.dim,
          {
            position: 'absolute' as const,
            left: 0,
            top: y + h,
            width: windowWidth,
            height: Math.max(0, windowHeight - (y + h)),
          },
        ],
      },
    ];
  }, [hole, windowWidth, windowHeight, styles.dim]);

  const actionsReserve = 118;
  const headerReserve = 52;
  const showBrandLogo = step.id === 'welcome' || step.id === 'finish';
  const bodyMaxHeight = Math.max(
    40,
    tooltipMaxHeight - actionsReserve - headerReserve - (showBrandLogo ? 40 : 0),
  );

  const clampedTop = Math.min(
    tooltipTop,
    Math.max(
      safeTop,
      safeBottom - Math.min(cardHeight || 200, tooltipMaxHeight),
    ),
  );
  const clampedMaxHeight = Math.max(140, safeBottom - clampedTop);

  return (
    <View style={styles.root} pointerEvents="box-none">
      {panes.map((pane) => (
        <View key={pane.key} style={pane.style} pointerEvents="none" />
      ))}
      {hole ? (
        <View
          pointerEvents="none"
          style={[
            styles.holeBorder,
            {
              left: hole.x - HOLE_PAD,
              top: hole.y - HOLE_PAD,
              width: hole.width + HOLE_PAD * 2,
              height: hole.height + HOLE_PAD * 2,
            },
          ]}
        />
      ) : null}

      <View
        style={[
          styles.tooltip,
          {
            top: clampedTop,
            maxHeight: Math.min(tooltipMaxHeight, clampedMaxHeight),
          },
        ]}
        pointerEvents="auto"
        onLayout={onCardLayout}
      >
        <Text style={styles.progress}>
          {stepIndex + 1} / {stepCount}
        </Text>
        {showBrandLogo ? (
          <View style={styles.logoWrap}>
            <AppBrandLogo variant="wordmark" height={24} />
          </View>
        ) : null}
        <Text style={styles.title}>{step.title}</Text>
        <ScrollView
          style={[styles.scroll, { maxHeight: bodyMaxHeight }]}
          contentContainerStyle={{ flexGrow: 0 }}
          showsVerticalScrollIndicator
          bounces={false}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.body}>{step.body}</Text>
        </ScrollView>
        <View style={styles.actions}>
          <PrimaryButton
            label={step.primaryLabel ?? 'Next'}
            onPress={onNext}
          />
          <Pressable style={styles.skip} onPress={onSkip} hitSlop={8}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
