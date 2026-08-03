import type { ViewStyle } from 'react-native';

export type ThemeId =
  | 'modernGreen'
  | 'darkGraphite'
  | 'softPastel'
  | 'warmCream'
  | 'oceanBlue'
  | 'midnightInk'
  | 'coralBloom'
  | 'slateSteel'
  | 'emberCopper'
  | 'arcticMint';

export type ThemeGradients = {
  progressUnder: readonly [string, string];
  progressOver: readonly [string, string];
  button: readonly [string, string];
  buttonAccent: readonly [string, string];
  card: readonly [string, string];
};

/**
 * Shared visual tokens for one theme.
 * Themes change color/gradient/shadow only — not layout or spacing structure.
 */
export type AppTheme = {
  id: ThemeId;
  name: string;
  /** Expo StatusBar style for this theme. */
  statusBarStyle: 'light' | 'dark';
  background: string;
  surface: string;
  elevatedSurface: string;
  primary: string;
  primaryAccent: string;
  progressTrack: string;
  success: string;
  danger: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnAccent: string;
  border: string;
  inputBackground: string;
  tabActive: string;
  tabInactive: string;
  placeholder: string;
  thumbnail: string;
  pin: string;
  cardShadow: ViewStyle;
  softShadow: ViewStyle;
  buttonShadow: ViewStyle;
  gradients: ThemeGradients;
  /** Compact swatch colors for the Settings picker. */
  preview: {
    background: string;
    primary: string;
    accent: string;
  };
};
