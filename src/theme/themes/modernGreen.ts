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

/** Default theme — clean, fresh, premium fitness green. */
export const modernGreen: AppTheme = {
  id: 'modernGreen',
  name: 'Modern Green',
  statusBarStyle: 'dark',
  background: '#F6F7F6',
  surface: '#FFFFFF',
  elevatedSurface: '#EEF1EF',
  primary: '#0F9F6E',
  primaryAccent: '#A3E635',
  progressTrack: '#E8EDE9',
  success: '#059669',
  danger: '#E11D48',
  textPrimary: '#141816',
  textSecondary: '#6B736E',
  textMuted: '#9AA39C',
  textOnAccent: '#FFFFFF',
  border: '#E4E8E5',
  inputBackground: '#FFFFFF',
  tabActive: '#0F9F6E',
  tabInactive: '#9AA39C',
  placeholder: '#A3ABA6',
  thumbnail: '#E8EDE9',
  pin: '#0F9F6E',
  cardShadow: shadow('#0B1410', 0.06, 12, 4, 2),
  softShadow: shadow('#0B1410', 0.08, 18, 8, 3),
  buttonShadow: shadow('#141816', 0.18, 8, 4, 3),
  gradients: {
    progressUnder: ['#059669', '#84CC16'],
    progressOver: ['#E11D48', '#FB7185'],
    button: ['#141816', '#1F2933'],
    buttonAccent: ['#047857', '#0F9F6E'],
    card: ['#FFFFFF', '#F3F7F4'],
  },
  preview: {
    background: '#F6F7F6',
    primary: '#0F9F6E',
    accent: '#A3E635',
  },
};
