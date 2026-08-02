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
} as const;

export type AppBrand = typeof appBrand;
