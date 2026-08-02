/**
 * Centralized app branding / identity.
 * UI must read display strings and brand assets from here —
 * do not hardcode the product name or scatter image requires.
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

/**
 * Dark green-black plate behind the wordmark / splash / Android adaptive.
 * Masters stay unchanged; production assets composite onto this tone.
 */
export const brandColors = {
  /** #0A120C — near-black with green undertone for lime Q contrast. */
  background: '#0A120C',
} as const;

/**
 * Production brand images (generated from masters; masters not overwritten).
 * Import only through AppBrandLogo / this config — not ad hoc in screens.
 */
export const brandAssets = {
  /** Cleaned horizontal wordmark (transparent). */
  logo: require('../../assets/brand-logo.png'),
  /** Transparent symbol for compact/light-surface treatments. */
  symbol: require('../../assets/android-icon-foreground.png'),
} as const;

/** Intrinsic wordmark aspect (brand-logo.png). */
export const BRAND_LOGO_ASPECT = 1200 / 346;

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
