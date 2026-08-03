import { Image } from 'react-native';
import {
  manipulateAsync,
  SaveFormat,
} from 'expo-image-manipulator';

/** Final square edge length for library photos. */
export const OPTIMIZED_IMAGE_SIZE = 512;

/** JPEG quality ~80–85%. */
export const OPTIMIZED_JPEG_COMPRESS = 0.82;

export type OptimizedImageResult = {
  uri: string;
  width: number;
  height: number;
};

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => {
        if (!width || !height) {
          reject(new Error('Could not read image dimensions'));
          return;
        }
        resolve({ width, height });
      },
      () => reject(new Error('Could not read image dimensions')),
    );
  });
}

function centerSquareCrop(width: number, height: number) {
  const side = Math.min(width, height);
  return {
    originX: Math.max(0, Math.floor((width - side) / 2)),
    originY: Math.max(0, Math.floor((height - side) / 2)),
    width: side,
    height: side,
  };
}

/**
 * Center-crop to square, resize to 512×512, encode JPEG ~0.82.
 * Does not write into permanent app folders — callers persist the result URI.
 * Throws on failure (callers must not save a broken URI).
 */
export async function optimizeLocalImage(
  sourceUri: string,
): Promise<OptimizedImageResult> {
  if (!sourceUri) {
    throw new Error('No image selected');
  }

  const { width, height } = await getImageSize(sourceUri);
  const crop = centerSquareCrop(width, height);

  const result = await manipulateAsync(
    sourceUri,
    [
      { crop },
      {
        resize: {
          width: OPTIMIZED_IMAGE_SIZE,
          height: OPTIMIZED_IMAGE_SIZE,
        },
      },
    ],
    {
      compress: OPTIMIZED_JPEG_COMPRESS,
      format: SaveFormat.JPEG,
    },
  );

  if (!result.uri) {
    throw new Error('Image optimization produced no file');
  }

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
  };
}
