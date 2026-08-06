import { Platform } from 'react-native';

/**
 * Tab bar content row (icons + labels), excluding the system bottom inset.
 * Total height = content + safe bottom padding so gesture / 3-button nav clear.
 */
export const TAB_BAR_CONTENT_HEIGHT = Platform.OS === 'ios' ? 49 : 56;

/**
 * Minimum bottom pad when the inset reports 0 (some Android configs).
 * Keeps labels above the system navigation affordance.
 */
export function tabBarBottomPad(bottomInset: number): number {
  const inset = Math.max(bottomInset, 0);
  if (Platform.OS === 'ios') {
    return Math.max(inset, 20);
  }
  return Math.max(inset, 8);
}

/** Full tab bar height including safe bottom padding. */
export function tabBarTotalHeight(bottomInset: number): number {
  return TAB_BAR_CONTENT_HEIGHT + tabBarBottomPad(bottomInset);
}
