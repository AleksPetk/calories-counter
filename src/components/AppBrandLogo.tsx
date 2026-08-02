import { useMemo, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  appBrand,
  brandAssets,
  BRAND_LOGO_ASPECT,
} from '../config/appBrand';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/ThemeProvider';

type AppBrandLogoProps = {
  /** Horizontal wordmark (default) or compact symbol-only. */
  variant?: 'wordmark' | 'symbol';
  /** Logo height in dp. Keep modest for headers. */
  height?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

/**
 * Single entry point for QuickCal logo imagery.
 * Screens must not require() brand PNGs directly.
 */
export function AppBrandLogo({
  variant = 'wordmark',
  height = 28,
  style,
  imageStyle,
}: AppBrandLogoProps) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);

  const width =
    variant === 'wordmark' ? Math.round(height * BRAND_LOGO_ASPECT) : height;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        imageWrap: {
          alignSelf: 'flex-start',
          maxWidth: '100%',
        },
        image: {
          width,
          height,
          maxWidth: '100%',
        },
        fallback: {
          ...typography.appTitle,
          color: theme.textPrimary,
        },
      }),
    [height, width, theme.textPrimary],
  );

  if (failed) {
    return (
      <Text
        style={[styles.fallback, style as object]}
        accessibilityRole="header"
        accessibilityLabel={appBrand.appName}
      >
        {appBrand.appName}
      </Text>
    );
  }

  return (
    <View style={[styles.imageWrap, style]}>
      <Image
        source={variant === 'wordmark' ? brandAssets.logo : brandAssets.symbol}
        style={[styles.image, imageStyle]}
        resizeMode="contain"
        accessibilityLabel={appBrand.appName}
        accessibilityRole="image"
        onError={() => setFailed(true)}
      />
    </View>
  );
}
