import { useMemo } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';

type LibraryThumbnailProps = {
  uri?: string | null;
  size: number;
  borderRadius: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Shared food/meal thumbnail.
 * Always uses a fixed-size clipped container so local file images render
 * consistently in row lists (Library / Home search) and the pin grid.
 */
export function LibraryThumbnail({
  uri,
  size,
  borderRadius,
  style,
}: LibraryThumbnailProps) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        frame: {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: theme.thumbnail,
          overflow: 'hidden',
        },
        image: {
          width: size,
          height: size,
        },
      }),
    [theme.thumbnail, size, borderRadius],
  );

  const trimmed = uri?.trim() || null;

  return (
    <View style={[styles.frame, style]}>
      {trimmed ? (
        <Image
          source={{ uri: trimmed }}
          style={styles.image}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : null}
    </View>
  );
}
