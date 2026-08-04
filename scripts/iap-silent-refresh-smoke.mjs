/**
 * Focused smoke: launch/foreground must not call interactive StoreKit restore.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const iapSrc = readFileSync(join(root, 'src/iap/iapService.ts'), 'utf8');
const entitlementSrc = readFileSync(
  join(root, 'src/entitlement/EntitlementProvider.tsx'),
  'utf8',
);

assert.match(iapSrc, /interactiveRestore\?: boolean/);
assert.match(iapSrc, /await mod\.restorePurchases\(\)/);
assert.match(
  iapSrc,
  /if \(options\.interactiveRestore\) \{\s*[\s\S]*?await mod\.restorePurchases\(\);/,
);

// Default queryOwnedLifetimePurchase path must not unconditionally restore.
const unconditionalRestore = /try \{\s*await mod\.restorePurchases\(\);\s*const purchases/;
assert.doesNotMatch(iapSrc, unconditionalRestore);

const refreshBlock = entitlementSrc.slice(
  entitlementSrc.indexOf('const refreshFromStore'),
  entitlementSrc.indexOf('const loadProduct'),
);
assert.ok(refreshBlock.includes('queryOwnedLifetimePurchase()'));
assert.ok(!refreshBlock.includes('interactiveRestore: true'));
assert.ok(!/\.restorePurchases\s*\(/.test(refreshBlock));

// Startup + foreground both use refreshFromStore (silent).
assert.match(entitlementSrc, /await refreshFromStore\(\)/);
assert.match(entitlementSrc, /state === 'active'[\s\S]*void refreshFromStore\(\)/);

// Explicit restore button path is interactive.
const restoreBlock = entitlementSrc.slice(
  entitlementSrc.indexOf('const restore = useCallback'),
  entitlementSrc.indexOf('const assertDevMutable'),
);
assert.match(
  restoreBlock,
  /queryOwnedLifetimePurchase\(\{\s*interactiveRestore: true,\s*\}\)/,
);

// Purchased Settings UI gates remain intact.
const settingsSrc = readFileSync(
  join(root, 'src/screens/SettingsScreen.tsx'),
  'utf8',
);
assert.match(settingsSrc, /const isPurchased = snapshot\?\.accessState === 'purchased'/);
assert.match(settingsSrc, /!isPurchased \? \(/);

console.log('ok iap silent launch/foreground refresh smoke');
