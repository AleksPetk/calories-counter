import type { AppTheme, ThemeId } from './types';
import { arcticMint } from './themes/arcticMint';
import { coralBloom } from './themes/coralBloom';
import { darkGraphite } from './themes/darkGraphite';
import { emberCopper } from './themes/emberCopper';
import { midnightInk } from './themes/midnightInk';
import { modernGreen } from './themes/modernGreen';
import { oceanBlue } from './themes/oceanBlue';
import { slateSteel } from './themes/slateSteel';
import { softPastel } from './themes/softPastel';
import { warmCream } from './themes/warmCream';

/** Default theme for new installs and invalid stored ids. */
export const DEFAULT_THEME_ID: ThemeId = 'modernGreen';

/**
 * Central theme registry.
 * To add a theme: create `themes/<id>.ts`, then add it here only.
 */
export const THEMES: Record<ThemeId, AppTheme> = {
  modernGreen,
  darkGraphite,
  softPastel,
  warmCream,
  oceanBlue,
  midnightInk,
  coralBloom,
  slateSteel,
  emberCopper,
  arcticMint,
};

/** Ordered list for Themes screen picker UI. */
export const THEME_LIST: AppTheme[] = [
  modernGreen,
  darkGraphite,
  softPastel,
  warmCream,
  oceanBlue,
  midnightInk,
  coralBloom,
  slateSteel,
  emberCopper,
  arcticMint,
];

export function isThemeId(value: string): value is ThemeId {
  return Object.prototype.hasOwnProperty.call(THEMES, value);
}

export function resolveTheme(themeId: string | null | undefined): AppTheme {
  if (themeId && isThemeId(themeId)) {
    return THEMES[themeId];
  }
  return THEMES[DEFAULT_THEME_ID];
}
