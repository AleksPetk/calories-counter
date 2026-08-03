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

/** Warm dark theme with copper ember accents. */
export const emberCopper: AppTheme = {
  id: 'emberCopper',
  name: 'Ember Copper',
  statusBarStyle: 'light',
  background: '#1A1410',
  surface: '#261E18',
  elevatedSurface: '#342820',
  primary: '#F59E0B',
  primaryAccent: '#FBBF24',
  progressTrack: '#3D3128',
  success: '#D97706',
  danger: '#FB7185',
  textPrimary: '#FAF7F2',
  textSecondary: '#C4B5A5',
  textMuted: '#8A7B6C',
  textOnAccent: '#1A1410',
  border: '#3D3128',
  inputBackground: '#261E18',
  tabActive: '#F59E0B',
  tabInactive: '#8A7B6C',
  placeholder: '#8A7B6C',
  thumbnail: '#3D3128',
  pin: '#F59E0B',
  cardShadow: shadow('#000000', 0.45, 14, 6, 4),
  softShadow: shadow('#000000', 0.5, 20, 10, 5),
  buttonShadow: shadow('#000000', 0.52, 10, 4, 4),
  gradients: {
    progressUnder: ['#D97706', '#FBBF24'],
    progressOver: ['#E11D48', '#FB7185'],
    button: ['#342820', '#261E18'],
    buttonAccent: ['#B45309', '#F59E0B'],
    card: ['#2C231C', '#261E18'],
  },
  preview: {
    background: '#1A1410',
    primary: '#F59E0B',
    accent: '#FBBF24',
  },
};
