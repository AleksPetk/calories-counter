/**
 * Stage 8 — trial derivation, soft-gate rules, erase preservation.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const TRIAL_DURATION_MS = 14 * 24 * 60 * 60 * 1000;

function deriveAccess(record, nowMs = Date.now()) {
  if (record.storePurchased) {
    return {
      accessState: 'purchased',
      canWrite: true,
      remainingMs: null,
      isStorePurchase: true,
      isSimulatedPurchase: false,
    };
  }
  if (record.simulatedPurchased) {
    return {
      accessState: 'purchased',
      canWrite: true,
      remainingMs: null,
      isStorePurchase: false,
      isSimulatedPurchase: true,
    };
  }
  const expiresAt = record.trialExpiresAt
    ? Date.parse(record.trialExpiresAt)
    : NaN;
  if (!Number.isFinite(expiresAt)) {
    return {
      accessState: 'trial_expired',
      canWrite: false,
      remainingMs: 0,
      isStorePurchase: false,
      isSimulatedPurchase: false,
    };
  }
  const remainingMs = expiresAt - nowMs;
  if (remainingMs > 0) {
    return {
      accessState: 'trial_active',
      canWrite: true,
      remainingMs,
      isStorePurchase: false,
      isSimulatedPurchase: false,
    };
  }
  return {
    accessState: 'trial_expired',
    canWrite: false,
    remainingMs: 0,
    isStorePurchase: false,
    isSimulatedPurchase: false,
  };
}

function accessStateToPurchaseState(accessState) {
  if (accessState === 'purchased') return 'purchased';
  if (accessState === 'trial_expired') return 'locked';
  return 'trial';
}

{
  const started = Date.parse('2026-08-01T00:00:00.000Z');
  const expires = new Date(started + TRIAL_DURATION_MS).toISOString();
  const mid = started + 3 * 24 * 60 * 60 * 1000;
  const active = deriveAccess(
    {
      trialStartedAt: new Date(started).toISOString(),
      trialExpiresAt: expires,
      storePurchased: false,
      simulatedPurchased: false,
    },
    mid,
  );
  assert.equal(active.accessState, 'trial_active');
  assert.equal(active.canWrite, true);
  assert.ok(active.remainingMs > 0);

  const expired = deriveAccess(
    {
      trialStartedAt: new Date(started).toISOString(),
      trialExpiresAt: expires,
      storePurchased: false,
      simulatedPurchased: false,
    },
    started + TRIAL_DURATION_MS + 1000,
  );
  assert.equal(expired.accessState, 'trial_expired');
  assert.equal(expired.canWrite, false);

  const oneMin = deriveAccess(
    {
      trialStartedAt: new Date(started).toISOString(),
      trialExpiresAt: new Date(mid + 60_000).toISOString(),
      storePurchased: false,
      simulatedPurchased: false,
    },
    mid,
  );
  assert.equal(oneMin.accessState, 'trial_active');
  assert.ok(oneMin.remainingMs <= 60_000);

  const sim = deriveAccess(
    {
      trialStartedAt: null,
      trialExpiresAt: new Date(mid - 1000).toISOString(),
      storePurchased: false,
      simulatedPurchased: true,
    },
    mid,
  );
  assert.equal(sim.accessState, 'purchased');
  assert.equal(sim.isSimulatedPurchase, true);
  assert.equal(sim.canWrite, true);

  const store = deriveAccess(
    {
      trialStartedAt: null,
      trialExpiresAt: null,
      storePurchased: true,
      simulatedPurchased: true,
    },
    mid,
  );
  assert.equal(store.accessState, 'purchased');
  assert.equal(store.isStorePurchase, true);
  assert.equal(store.isSimulatedPurchase, false);

  assert.equal(accessStateToPurchaseState('trial_active'), 'trial');
  assert.equal(accessStateToPurchaseState('trial_expired'), 'locked');
  assert.equal(accessStateToPurchaseState('purchased'), 'purchased');
}

{
  // Soft-gate matrix: writes locked when expired; settings-like actions stay free (documented).
  const lockedWrites = [
    'quick_log',
    'library_quick_log',
    'portion_log',
    'library_add',
    'library_edit',
    'library_delete',
    'pin_toggle',
    'log_edit',
    'profile_write',
  ];
  const allowedWhenExpired = [
    'browse_home',
    'browse_library',
    'browse_history',
    'todays_log_readonly',
    'settings',
    'theme',
    'goal',
    'reset_time',
    'retention',
    'clear_history',
    'erase_all',
    'tutorial_replay',
    'app_info',
    'purchase',
    'restore',
  ];
  assert.equal(lockedWrites.length, 9);
  assert.equal(allowedWhenExpired.length, 15);
  const expired = deriveAccess({
    trialStartedAt: '2026-01-01T00:00:00.000Z',
    trialExpiresAt: '2026-01-15T00:00:00.000Z',
    storePurchased: false,
    simulatedPurchased: false,
  }, Date.parse('2026-02-01T00:00:00.000Z'));
  assert.equal(expired.canWrite, false);
  // Gate: blocked write ⇒ open paywall (app wiring); canWrite false is the signal.
  assert.equal(expired.canWrite === false, true);
}

{
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE entitlement (
      id INTEGER PRIMARY KEY,
      trial_started_at TEXT,
      trial_expires_at TEXT,
      store_purchased INTEGER,
      store_product_id TEXT,
      store_platform TEXT,
      store_purchased_at TEXT,
      last_store_check_at TEXT,
      simulated_purchased INTEGER,
      updated_at TEXT
    );
    CREATE TABLE settings (
      id INTEGER PRIMARY KEY,
      purchase_state TEXT,
      daily_goal REAL,
      theme_id TEXT
    );
    CREATE TABLE library_items (id TEXT PRIMARY KEY, name TEXT);
  `);

  const trialStart = '2026-08-01T10:00:00.000Z';
  const trialEnd = '2026-08-15T10:00:00.000Z';
  db.prepare(`
    INSERT INTO entitlement VALUES (
      1, ?, ?, 1, 'com.alekspetk.quickcal.lifetime', 'ios',
      '2026-08-02T00:00:00.000Z', '2026-08-02T00:00:00.000Z', 1, '2026-08-02T00:00:00.000Z'
    )
  `).run(trialStart, trialEnd);
  db.prepare(`INSERT INTO settings VALUES (1, 'purchased', 2000, 'oceanBlue')`).run();
  db.prepare(`INSERT INTO library_items VALUES ('a', 'Egg')`).run();

  // Simulate erase: wipe library + reset settings defaults, preserve entitlement core.
  db.prepare(`DELETE FROM library_items`).run();
  const ent = db.prepare(`SELECT * FROM entitlement WHERE id=1`).get();
  db.prepare(`
    UPDATE entitlement SET simulated_purchased = 0, updated_at = ?
    WHERE id = 1
  `).run('2026-08-02T12:00:00.000Z');
  db.prepare(`
    UPDATE settings SET purchase_state = 'purchased', daily_goal = 2200, theme_id = 'modernGreen'
    WHERE id = 1
  `).run();

  const after = db.prepare(`SELECT * FROM entitlement WHERE id=1`).get();
  assert.equal(after.trial_started_at, trialStart);
  assert.equal(after.trial_expires_at, trialEnd);
  assert.equal(after.store_purchased, 1);
  assert.equal(after.store_product_id, 'com.alekspetk.quickcal.lifetime');
  assert.equal(after.simulated_purchased, 0);
  assert.equal(db.prepare(`SELECT COUNT(*) AS c FROM library_items`).get().c, 0);
  assert.equal(
    db.prepare(`SELECT purchase_state FROM settings WHERE id=1`).get().purchase_state,
    'purchased',
  );
  assert.ok(ent);
}

{
  const appIds = readFileSync(join(root, 'src/config/appIds.ts'), 'utf8');
  assert.match(appIds, /com\.alekspetk\.quickcal/);
  assert.match(appIds, /com\.alekspetk\.quickcal\.lifetime/);
  assert.match(appIds, /quickcal_lifetime/);

  const storeAvail = readFileSync(
    join(root, 'src/iap/storeAvailability.ts'),
    'utf8',
  );
  assert.match(storeAvail, /requireOptionalNativeModule/);
  assert.match(storeAvail, /ExpoIap/);

  const navRef = readFileSync(
    join(root, 'src/navigation/navigationRef.ts'),
    'utf8',
  );
  assert.match(navRef, /dismissPaywall/);
  assert.match(navRef, /canGoBack/);

  const paywall = readFileSync(
    join(root, 'src/screens/paywall/PaywallScreen.tsx'),
    'utf8',
  );
  assert.doesNotMatch(paywall, /navigation\.goBack\(\)/);
  assert.match(paywall, /closePaywall/);

  const deriveSrc = readFileSync(
    join(root, 'src/entitlement/deriveAccess.ts'),
    'utf8',
  );
  assert.match(deriveSrc, /trial_active/);
  assert.match(deriveSrc, /storePurchased/);

  const eraseSrc = readFileSync(
    join(root, 'src/data/erase/eraseAllData.ts'),
    'utf8',
  );
  assert.match(eraseSrc, /trialStartedAt/);
  assert.match(eraseSrc, /storePurchased/);
  assert.match(eraseSrc, /simulatedPurchased: false/);

  const appJson = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8'));
  assert.equal(appJson.expo.ios.bundleIdentifier, 'com.alekspetk.quickcal');
  assert.equal(appJson.expo.android.package, 'com.alekspetk.quickcal');
  assert.ok(appJson.expo.plugins.includes('expo-iap'));
  assert.ok(appJson.expo.plugins.includes('expo-dev-client'));

  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.ok(pkg.dependencies['expo-iap']);
  assert.ok(pkg.dependencies['expo-dev-client']);
}

console.log('stage8-smoke: ok');
