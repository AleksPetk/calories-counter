import { Platform, ViewStyle } from 'react-native';

import { colors } from './colors';

export const shadows = {
  soft: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0B1410',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 18,
    },
    android: {
      elevation: 3,
    },
    default: {},
  }),
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0B1410',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
  button: Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.charcoal,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
    },
    android: {
      elevation: 3,
    },
    default: {},
  }),
} as const;
