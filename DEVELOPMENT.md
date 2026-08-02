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

### Manual checks (Expo Go)

1. Fresh install / empty DB → library populates with seed items
2. Relaunch → seed does not duplicate
3. Settings → reset & reseed → confirmation → catalog restored
4. Production-like: release builds must not show the reset row
