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

/** White/light-blue background with blue gradient accents. */
export const oceanBlue: AppTheme = {
  id: 'oceanBlue',
  name: 'Ocean Blue',
  statusBarStyle: 'dark',
  background: '#F0F7FB',
  surface: '#FFFFFF',
  elevatedSurface: '#E3EEF5',
  primary: '#2563EB',
  primaryAccent: '#38BDF8',
  progressTrack: '#DCEAF3',
  success: '#0EA5E9',
  danger: '#E11D48',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textOnAccent: '#FFFFFF',
  border: '#D5E4EF',
  inputBackground: '#FFFFFF',
  tabActive: '#2563EB',
  tabInactive: '#94A3B8',
  placeholder: '#94A3B8',
  thumbnail: '#DCEAF3',
  pin: '#2563EB',
  cardShadow: shadow('#0F172A', 0.07, 14, 5, 2),
  softShadow: shadow('#0F172A', 0.09, 18, 8, 3),
  buttonShadow: shadow('#1E3A8A', 0.2, 8, 4, 3),
  gradients: {
    progressUnder: ['#2563EB', '#38BDF8'],
    progressOver: ['#E11D48', '#FB7185'],
    button: ['#0F172A', '#1E293B'],
    buttonAccent: ['#1D4ED8', '#2563EB'],
    card: ['#FFFFFF', '#EAF4FA'],
  },
  preview: {
    background: '#F0F7FB',
    primary: '#2563EB',
    accent: '#38BDF8',
  },
};
