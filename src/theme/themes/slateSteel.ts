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

/** Cool steel-gray minimal light theme. */
export const slateSteel: AppTheme = {
  id: 'slateSteel',
  name: 'Slate Steel',
  statusBarStyle: 'dark',
  background: '#F4F5F7',
  surface: '#FFFFFF',
  elevatedSurface: '#E8EAEE',
  primary: '#475569',
  primaryAccent: '#94A3B8',
  progressTrack: '#E2E5EA',
  success: '#0F766E',
  danger: '#E11D48',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textOnAccent: '#FFFFFF',
  border: '#DCE0E6',
  inputBackground: '#FFFFFF',
  tabActive: '#334155',
  tabInactive: '#94A3B8',
  placeholder: '#A8B0BC',
  thumbnail: '#E2E5EA',
  pin: '#475569',
  cardShadow: shadow('#0F172A', 0.06, 12, 4, 2),
  softShadow: shadow('#0F172A', 0.08, 18, 8, 3),
  buttonShadow: shadow('#0F172A', 0.18, 8, 4, 3),
  gradients: {
    progressUnder: ['#334155', '#64748B'],
    progressOver: ['#E11D48', '#FB7185'],
    button: ['#0F172A', '#1E293B'],
    buttonAccent: ['#334155', '#475569'],
    card: ['#FFFFFF', '#F1F3F6'],
  },
  preview: {
    background: '#F4F5F7',
    primary: '#475569',
    accent: '#94A3B8',
  },
};
