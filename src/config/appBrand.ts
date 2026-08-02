/**
 * Centralized app branding / identity.
 * UI must read display strings from here — do not hardcode the product name.
 */
export const appBrand = {
  appName: 'QuickCal',
  appSubtitle: 'Calorie Counter',
  version: '1.0.0',
  /** Placeholder until legal entity is set. */
  companyName: '',
  /**
   * Legal URLs — leave empty until real docs.alekspetk.com pages exist.
   * UI must not open placeholder/example.com links.
   */
  privacyPolicyUrl: '',
  termsUrl: '',
  contactEmail: '',
} as const;

export type AppBrand = typeof appBrand;

/** True only for configured https docs.alekspetk.com (or future real) URLs. */
export function isLegalUrlConfigured(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') {
      return false;
    }
    // Reject obvious placeholders.
    if (
      parsed.hostname === 'example.com' ||
      parsed.hostname.endsWith('.example.com')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
