import { normalizeLoggingMode } from '../../types/libraryItem';

export type LibraryItemTapAction = 'quick-log' | 'open-portion';

export { normalizeLoggingMode };

/**
 * Home pin/search tap routing.
 * Quick → log immediately. Portion (or anything else) → open portion sheet.
 */
export function resolveLibraryItemTapAction(
  loggingMode: string | null | undefined,
): LibraryItemTapAction {
  return normalizeLoggingMode(loggingMode) === 'quick'
    ? 'quick-log'
    : 'open-portion';
}

