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

/** Deep ink background with cool cyan performance accent. */
export const midnightInk: AppTheme = {
  id: 'midnightInk',
  name: 'Midnight Ink',
  statusBarStyle: 'light',
  background: '#0B1220',
  surface: '#151D2E',
  elevatedSurface: '#1E2940',
  primary: '#22D3EE',
  primaryAccent: '#67E8F9',
  progressTrack: '#243047',
  success: '#2DD4BF',
  danger: '#FB7185',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textOnAccent: '#0B1220',
  border: '#243047',
  inputBackground: '#151D2E',
  tabActive: '#22D3EE',
  tabInactive: '#64748B',
  placeholder: '#64748B',
  thumbnail: '#243047',
  pin: '#22D3EE',
  cardShadow: shadow('#000000', 0.42, 14, 6, 4),
  softShadow: shadow('#000000', 0.48, 20, 10, 5),
  buttonShadow: shadow('#000000', 0.5, 10, 4, 4),
  gradients: {
    progressUnder: ['#0891B2', '#22D3EE'],
    progressOver: ['#E11D48', '#FB7185'],
    button: ['#1E2940', '#151D2E'],
    buttonAccent: ['#0E7490', '#22D3EE'],
    card: ['#1A2438', '#151D2E'],
  },
  preview: {
    background: '#0B1220',
    primary: '#22D3EE',
    accent: '#67E8F9',
  },
};
