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

/** Soft blush surfaces with coral energy accents. */
export const coralBloom: AppTheme = {
  id: 'coralBloom',
  name: 'Coral Bloom',
  statusBarStyle: 'dark',
  background: '#FFF7F5',
  surface: '#FFFFFF',
  elevatedSurface: '#FFE8E2',
  primary: '#E11D48',
  primaryAccent: '#FB7185',
  progressTrack: '#F8DFD9',
  success: '#059669',
  danger: '#BE123C',
  textPrimary: '#1F1216',
  textSecondary: '#8A6570',
  textMuted: '#B08A93',
  textOnAccent: '#FFFFFF',
  border: '#F0D7D1',
  inputBackground: '#FFFFFF',
  tabActive: '#E11D48',
  tabInactive: '#B08A93',
  placeholder: '#C4A0A8',
  thumbnail: '#F8DFD9',
  pin: '#E11D48',
  cardShadow: shadow('#4A1D27', 0.07, 12, 4, 2),
  softShadow: shadow('#4A1D27', 0.09, 18, 8, 3),
  buttonShadow: shadow('#9F1239', 0.22, 8, 4, 3),
  gradients: {
    progressUnder: ['#E11D48', '#FB7185'],
    progressOver: ['#9F1239', '#E11D48'],
    button: ['#1F1216', '#3F1D28'],
    buttonAccent: ['#BE123C', '#E11D48'],
    card: ['#FFFFFF', '#FFF1EE'],
  },
  preview: {
    background: '#FFF7F5',
    primary: '#E11D48',
    accent: '#FB7185',
  },
};
