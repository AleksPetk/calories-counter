import { strFromU8, strToU8, unzipSync, zipSync, type Zippable } from 'fflate';

/**
 * Build a ZIP archive from path → bytes.
 * JPEG/PNG use level 0 (already compressed).
 */
export function createZipArchive(
  files: Record<string, Uint8Array>,
): Uint8Array {
  const zippable: Zippable = {};
  for (const [path, data] of Object.entries(files)) {
    const lower = path.toLowerCase();
    const alreadyCompressed =
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.png') ||
      lower.endsWith('.webp');
    zippable[path] = alreadyCompressed
      ? [data, { level: 0 }]
      : [data, { level: 6 }];
  }
  return zipSync(zippable);
}

export function readZipArchive(
  zipBytes: Uint8Array,
): Record<string, Uint8Array> {
  return unzipSync(zipBytes);
}

export function encodeUtf8(text: string): Uint8Array {
  return strToU8(text);
}

export function decodeUtf8(bytes: Uint8Array): string {
  return strFromU8(bytes);
}
