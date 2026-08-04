/**
 * Sanitize ZIP entry paths for backup image extraction.
 * Only `images/<safe-filename>` is allowed — blocks traversal and absolute paths.
 */
export function sanitizeBackupImageEntryPath(
  rawPath: string,
): string | null {
  if (typeof rawPath !== 'string' || !rawPath) {
    return null;
  }
  if (rawPath.includes('\0')) {
    return null;
  }

  const normalized = rawPath.replace(/\\/g, '/').replace(/^\.\//, '');
  if (
    normalized.startsWith('/') ||
    normalized.startsWith('~/') ||
    /^[A-Za-z]:\//.test(normalized)
  ) {
    return null;
  }

  const parts = normalized.split('/').filter((part) => part.length > 0);
  if (parts.some((part) => part === '.' || part === '..')) {
    return null;
  }
  if (parts.length !== 2 || parts[0] !== 'images') {
    return null;
  }

  const fileName = parts[1];
  if (
    !/^[A-Za-z0-9][A-Za-z0-9._-]*\.(jpg|jpeg|png|webp)$/i.test(fileName)
  ) {
    return null;
  }

  return `images/${fileName}`;
}

/** Safe basename for writing into the app image directories. */
export function safeImageFileName(
  relativePath: string,
  fallbackExt = 'jpg',
): string {
  const sanitized = sanitizeBackupImageEntryPath(relativePath);
  const base = sanitized ? sanitized.slice('images/'.length) : null;
  if (base) {
    return base;
  }
  return `restored.${fallbackExt}`;
}
