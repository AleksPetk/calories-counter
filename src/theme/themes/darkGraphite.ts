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

/** Dark background with lime/green performance accent. */
export const darkGraphite: AppTheme = {
  id: 'darkGraphite',
  name: 'Dark Graphite',
  statusBarStyle: 'light',
  background: '#121417',
  surface: '#1C1F24',
  elevatedSurface: '#262A31',
  primary: '#A3E635',
  primaryAccent: '#84CC16',
  progressTrack: '#2E333B',
  success: '#A3E635',
  danger: '#FB7185',
  textPrimary: '#F4F5F6',
  textSecondary: '#A8ADB6',
  textMuted: '#6B7280',
  textOnAccent: '#121417',
  border: '#2E333B',
  inputBackground: '#1C1F24',
  tabActive: '#A3E635',
  tabInactive: '#6B7280',
  placeholder: '#6B7280',
  thumbnail: '#2E333B',
  pin: '#A3E635',
  cardShadow: shadow('#000000', 0.4, 14, 6, 4),
  softShadow: shadow('#000000', 0.45, 20, 10, 5),
  buttonShadow: shadow('#000000', 0.5, 10, 4, 4),
  gradients: {
    progressUnder: ['#84CC16', '#A3E635'],
    progressOver: ['#E11D48', '#FB7185'],
    button: ['#2E333B', '#1C1F24'],
    buttonAccent: ['#65A30D', '#A3E635'],
    card: ['#22262D', '#1C1F24'],
  },
  preview: {
    background: '#121417',
    primary: '#A3E635',
    accent: '#84CC16',
  },
};
