/**
 * Human-readable remaining trial time for paywall / settings.
 */
export function formatRemainingTrial(remainingMs: number | null): string {
  if (remainingMs == null || remainingMs <= 0) {
    return 'Trial ended';
  }

  const totalSeconds = Math.ceil(remainingMs / 1000);
  if (totalSeconds < 60) {
    return `${totalSeconds}s remaining`;
  }

  const totalMinutes = Math.ceil(remainingMs / (60 * 1000));
  if (totalMinutes < 60) {
    return `${totalMinutes} min remaining`;
  }

  const totalHours = Math.ceil(remainingMs / (60 * 60 * 1000));
  if (totalHours < 48) {
    return `${totalHours} hour${totalHours === 1 ? '' : 's'} remaining`;
  }

  const totalDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
  return `${totalDays} day${totalDays === 1 ? '' : 's'} remaining`;
}
