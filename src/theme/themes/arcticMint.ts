import { Platform, ViewStyle } from 'react-native';

import type { AppTheme } from '../types';

function shadow(
  color: string,
  opacity: number,
  radius: number,
  offsetY: number,
  elevation: number,
): ViewStyle {
  return (
    Platform.select<ViewStyle>({
      ios: {
        shadowColor: color,
        shadowOffset: { width: 0, height: offsetY },
        shadowOpacity: opacity,
        shadowRadius: radius,
      },
      android: { elevation },
      default: {},
    }) ?? {}
  );
}

/** Icy mint/teal light theme — crisp and fresh. */
export const arcticMint: AppTheme = {
  id: 'arcticMint',
  name: 'Arctic Mint',
  statusBarStyle: 'dark',
  background: '#F2FBFA',
  surface: '#FFFFFF',
  elevatedSurface: '#E0F5F2',
  primary: '#0D9488',
  primaryAccent: '#5EEAD4',
  progressTrack: '#D5EFEA',
  success: '#0F766E',
  danger: '#E11D48',
  textPrimary: '#134E4A',
  textSecondary: '#5F8A85',
  textMuted: '#8AADA8',
  textOnAccent: '#FFFFFF',
  border: '#CDE8E3',
  inputBackground: '#FFFFFF',
  tabActive: '#0D9488',
  tabInactive: '#8AADA8',
  placeholder: '#9BBDB8',
  thumbnail: '#D5EFEA',
  pin: '#0D9488',
  cardShadow: shadow('#134E4A', 0.06, 12, 4, 2),
  softShadow: shadow('#134E4A', 0.08, 18, 8, 3),
  buttonShadow: shadow('#0F766E', 0.2, 8, 4, 3),
  gradients: {
    progressUnder: ['#0F766E', '#5EEAD4'],
    progressOver: ['#E11D48', '#FB7185'],
    button: ['#134E4A', '#1A5C56'],
    buttonAccent: ['#0F766E', '#0D9488'],
    card: ['#FFFFFF', '#EAF8F6'],
  },
  preview: {
    background: '#F2FBFA',
    primary: '#0D9488',
    accent: '#5EEAD4',
  },
};
