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

/** Light lavender/pink — calm and modern. */
export const softPastel: AppTheme = {
  id: 'softPastel',
  name: 'Soft Pastel',
  statusBarStyle: 'dark',
  background: '#F8F4FA',
  surface: '#FFFFFF',
  elevatedSurface: '#F0E8F4',
  primary: '#9B7EBD',
  primaryAccent: '#E8A0BF',
  progressTrack: '#EDE4F2',
  success: '#7C9A7E',
  danger: '#D9778F',
  textPrimary: '#2D2438',
  textSecondary: '#7A6F88',
  textMuted: '#A89BB5',
  textOnAccent: '#FFFFFF',
  border: '#E8DFEE',
  inputBackground: '#FFFFFF',
  tabActive: '#9B7EBD',
  tabInactive: '#A89BB5',
  placeholder: '#B5A8C4',
  thumbnail: '#EDE4F2',
  pin: '#9B7EBD',
  cardShadow: shadow('#3B2A4A', 0.07, 14, 5, 2),
  softShadow: shadow('#3B2A4A', 0.09, 18, 8, 3),
  buttonShadow: shadow('#3B2A4A', 0.16, 8, 4, 3),
  gradients: {
    progressUnder: ['#9B7EBD', '#E8A0BF'],
    progressOver: ['#D9778F', '#F0A8B8'],
    button: ['#4A3B5C', '#2D2438'],
    buttonAccent: ['#8B6BAD', '#9B7EBD'],
    card: ['#FFFFFF', '#F7F0F8'],
  },
  preview: {
    background: '#F8F4FA',
    primary: '#9B7EBD',
    accent: '#E8A0BF',
  },
};
