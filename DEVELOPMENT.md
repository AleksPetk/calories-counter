# Development notes

## Dev seed library

In development builds (`__DEV__ === true`), the app seeds a sample **library item** catalog when `library_items` is empty.

- Auto-seed runs once after DB init via `DataProvider`.
- Seed is idempotent: if any library item exists, seed is skipped.
- Catalog mixes **Quick Log** and **Portion** items.
- Production/release builds never call seed helpers and never show the reset action.

### Reset & reseed (dev only)

Settings → **Dev: reset & reseed library** (only visible under `__DEV__`):

1. Confirms with an alert
2. Deletes all library items (cleans managed library images)
3. Inserts the seed catalog again

Logging tables are not cleared by this action.

### Seed data location

- `src/data/seed/devSeedData.ts` — mixed Quick/Portion catalog
- `src/data/seed/seedDevData.ts` — `seedDevLibraryIfEmpty`, `resetAndReseedDevLibrary`

Release safety is `__DEV__` gating (UI + seed entry points).

### History retention cleanup

- Runs after DB init in `DataProvider`.
- Also runs immediately when the user selects a *shorter* retention window.
- Deletes only `daily_log_entries` older than the window; never library/profile/settings.

### Stage 8 — Trial & IAP

#### Trial (app-managed)

- Length: **14 days** from first successful entitlement bootstrap.
- Stored in SQLite `entitlement` (`trial_started_at`, `trial_expires_at`), **not** ordinary settings.
- Restart / update does not reset the trial.
- **Erase All Data** preserves trial timestamps and real store purchase cache; clears simulated DEV purchase only.
- Uninstall/reinstall clears local SQLite. On a fresh install the trial can start again. Apple/Google purchase restore still works for a real lifetime buy on the same store account/platform. There is no QuickCal backend to prevent trial reinstall abuse.

#### Soft gate after expiry

Locked writes open the paywall. Browse Home/Library/History (read-only), Settings, Restore, Erase, and legal (when configured) remain available. Existing data is never deleted on expiry.

#### DEV entitlement panel

Settings → **DEV · Entitlement tools** (`__DEV__` only):

- Start fresh test trial / 1 minute remaining / expire now / simulate purchased / reset simulated
- Refuses to overwrite a confirmed real-store purchase cache

#### Store IAP (`expo-iap`)

- Product IDs: see `src/config/appIds.ts`
- Expo Go: UI + local trial/DEV simulation only — **cannot** load store price, purchase, or restore
- Use an **EAS development build** for real billing tests

```bash
npm install -g eas-cli
eas login
eas build:configure   # once; links project + writes projectId
eas build --profile development --platform ios
eas build --profile development --platform android
npx expo start --dev-client
```

#### Manual store setup (required before sandbox purchase)

**App Store Connect**

1. App with bundle id `com.alekspetk.quickcal`
2. Non-consumable IAP `com.alekspetk.quickcal.lifetime`
3. Pricing + localization
4. Sandbox Apple ID for device testing

**Google Play Console**

1. App with package `com.alekspetk.quickcal`
2. One-time product `quickcal_lifetime` (non-consumable)
3. Activate product; add license testers
4. Internal testing track with a build that includes billing

#### Manual checks

**Expo Go / local trial**

1. Fresh DB → trial starts; Status shows remaining time
2. Relaunch → same trial window
3. DEV → 1 minute remaining → after expiry, logging opens paywall; library still browseable
4. DEV → simulate purchased → writes unlock; labeled simulated
5. Erase All → library wiped; trial timestamps + store purchase preserved

**Development build (store)**

1. Price loads from store
2. Purchase success unlocks; cancel/fail does not
3. Restore restores same-platform purchase
4. Offline restart keeps cached store entitlement

### Manual checks (Expo Go — Stages 5–7)

1. Fresh install / empty DB → library populates with seed items; tutorial may appear
2. Relaunch → seed does not duplicate; tutorial stays dismissed after Skip/Done
3. Settings → reset & reseed → confirmation → catalog restored
4. Production-like: release builds must not show the reset row
