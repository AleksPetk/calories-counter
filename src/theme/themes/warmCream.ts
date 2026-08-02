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

/** Cream background with warm brown/orange accents. */
export const warmCream: AppTheme = {
  id: 'warmCream',
  name: 'Warm Cream',
  statusBarStyle: 'dark',
  background: '#F7F1E8',
  surface: '#FFFCF7',
  elevatedSurface: '#EFE6D8',
  primary: '#C45C26',
  primaryAccent: '#E8A87C',
  progressTrack: '#E8DFD0',
  success: '#8B7355',
  danger: '#C0392B',
  textPrimary: '#2C241B',
  textSecondary: '#7A6E60',
  textMuted: '#A89A88',
  textOnAccent: '#FFFCF7',
  border: '#E5D9C8',
  inputBackground: '#FFFCF7',
  tabActive: '#C45C26',
  tabInactive: '#A89A88',
  placeholder: '#B5A794',
  thumbnail: '#E8DFD0',
  pin: '#C45C26',
  cardShadow: shadow('#3D2E1F', 0.08, 14, 5, 2),
  softShadow: shadow('#3D2E1F', 0.1, 18, 8, 3),
  buttonShadow: shadow('#3D2E1F', 0.18, 8, 4, 3),
  gradients: {
    progressUnder: ['#C45C26', '#E8A87C'],
    progressOver: ['#C0392B', '#E57373'],
    button: ['#3D2E1F', '#2C241B'],
    buttonAccent: ['#A34A1E', '#C45C26'],
    card: ['#FFFCF7', '#F3EADF'],
  },
  preview: {
    background: '#F7F1E8',
    primary: '#C45C26',
    accent: '#E8A87C',
  },
};
