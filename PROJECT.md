# Calories Counter — Project Plan

## Vision

Calories Counter is a mobile app whose only job is to make logging calories as fast as possible.

Most calorie apps are slow because they force searching a huge shared database. This app rejects that model. The user builds a personal food library once. After that, logging is mostly one tap for saved meals, or a short portion entry for ingredients.

The product succeeds when a frequent meal can be logged in under two seconds, the app works fully offline, and nothing on screen exists that does not serve logging or reviewing intake.

---

## MVP Features

### Food library (user-owned)

- Create foods (ingredients) with name and calories (and optionally protein/carbs/fat if decided).
- Create meals as named collections of foods with fixed portions.
- Edit and delete foods and meals.
- Favorites / pin frequently used items for one-tap access on the home/log screen.

### Logging

- One-tap log of a saved meal (adds predefined calories for “now” / selected day).
- Log an ingredient by entering a portion (e.g. grams, servings, or units — unit model TBD).
- Quick adjust: undo last log, or delete/edit a logged entry.
- View today’s total calories (and macros if included in MVP).
- Browse previous days’ logs (read + edit).

### Offline & storage

- 100% offline operation.
- All data stored locally on device.
- No account required for MVP.

### Monetization

- Free trial period.
- Unlock via one-time purchase (no subscription in MVP).
- Trial/purchase state stored/validated in a way that survives normal app use (exact mechanism TBD).

### UI / UX (MVP bar)

- Minimal screens: Log (home), Library, Day/History, Settings.
- Large tap targets for favorite meals on the home screen.
- Clear today’s calorie total always visible when logging.
- No onboarding wizards beyond the minimum needed to understand library + log.

### Explicitly out of MVP

- Shared / cloud food databases
- Barcode scanning
- Social features
- Recipes with multi-step cooking
- Wearables / HealthKit sync (candidate for later)
- Accounts or cloud sync (candidate for later)
- Charts beyond a simple daily total / short history
- AI meal recognition
- Water, steps, weight coaching suites

---

## Future Features

Prioritized roughly by how well they support the speed/offline philosophy:

1. **Optional cloud sync** — same user across devices; still offline-first.
2. **Encrypted backups** — optional passphrase on the local ZIP export.
3. **Macros & goals** — daily calorie/macro targets with simple progress.
4. **Templates / meal slots** — breakfast/lunch/dinner shortcuts if they reduce taps.
5. **Portion presets** — “usual amount” per ingredient for even faster logging.
6. **Widgets / shortcuts** — home-screen one-tap log for pinned meals (platform-dependent).
7. **Health platform sync** — Apple Health / Google Health Connect (write calories).
8. **Barcode for personal library only** — scan to attach a code to *your* food, not a global DB.
9. **Copy day / repeat yesterday** — bulk log for routine days.
10. **Light analytics** — weekly averages; keep charts optional and minimal.

Features that fight the philosophy (large search DBs, social, ads, subscription pressure) stay rejected unless the vision changes.

---

## Design Philosophy

### Speed first

- Optimize for the 80% case: logging a meal the user already knows.
- Measure success in taps and seconds, not feature count.
- Default navigation lands on Log, not Library or Settings.

### User-owned data

- No bloated shared food catalog.
- The library is small, personal, and fast to browse.
- Creating a food/meal is a deliberate setup cost that pays off in one-tap reuse.

### Minimal UI

- Clean layout, strong hierarchy, high contrast for glanceability.
- Prefer lists and large action buttons over dense forms.
- No decorative chrome, empty-state spam, or marketing surfaces inside the app.
- Every screen has one primary job.

### Offline by default

- No network required for core flows.
- Purchase/restore may need network once; logging never does.

### Restraint

- If a feature does not reduce taps, improve trust in totals, or protect data, it waits.
- Prefer one good way to do something over three modes.

### Monetization honesty

- Free trial, then a clear one-time unlock.
- No dark patterns, fake urgency, or feature hostage beyond the stated trial gate.

---

## Development Stages

### Stage 1 — Foundation — Done

- Git and repository setup
- Planning documents
- Cursor rules
- Expo TypeScript project
- Compatible Expo SDK
- Verify on physical device

### Stage 2 — Architecture — Done

- Folder structure under `src/`
- React Navigation bottom tabs: Home | Library | History | Settings
- Empty Home, Library, History, and Settings screens
- Shared `components`, `constants`, and `theme`
- No database, state management, or business logic
- Shared `types` deferred until real domain types exist

### Stage 3 — UI Skeleton — Done

- Screen layouts and shared UI structure for Home, Library, History, and Settings
- Remaining calorie bar, quick calorie entry, and expandable optional name/macros as UI only
- Visual design direction (Stage 3.1)
- No business logic wired to persistence

### Stage 4 — Local Database — Done

- SQLite setup via `expo-sqlite`
- Typed domain models
- Repository/storage layer
- Migration strategy (`PRAGMA user_version`)
- DB initialized on app launch; UI not yet reading/writing repositories

### Stage 5 — Food Library — Done

- Foods and meals
- Create, edit, delete
- Search
- Pin/unpin
- Optional food/meal images (persisted under the app document directory)

### Stage 5.1 — Theme System and Home UI Refinement — Done

- Reusable multi-theme system (one file per theme + central registry)
- Settings theme picker with persistence
- Compact Home calorie card and 3-column pin grid
- Keyboard-aware Food/Meal editors

### Stage 6 — Logging Core — Done

- One-tap Quick Log items + Portion popup logging
- Unified `library_items` model (schema v3 migration)
- Today’s log, edit/delete, undo
- QuickCal branding config

### Stage 7 — History, Settings, and Tutorial — In progress

- Browse previous days; edit/delete past entries; daily totals
- Daily goal, reset time, history retention
- Clear History vs Erase All Data (purchase entitlement preserved)
- Local profile + photo
- First-launch / replay tutorial
- App Information

Do not mark complete until device verification.

### Stage 8 — Trial and One-Time Purchase — In progress

- App-managed 14-day trial (`entitlement` table, separate from settings)
- Soft gate after expiry (browse OK; writes → paywall)
- `expo-iap` lifetime unlock + restore (dev/store builds)
- Local entitlement cache; Erase All preserves trial + store purchase
- `__DEV__` entitlement test panel

Do not mark complete until device + sandbox verification.

### Stage 9 — UX Fixes, Backup, History Polish — Implemented (code)

- Library / Home list thumbnails share the same image component as pins
- Undo Last requires confirmation (Cancel / Remove)
- History day summary expands to Calories / Protein / Carbs / Fat
- Local ZIP backup & restore (Settings → Export / Import); no cloud/accounts
- StoreKit / entitlement **not** included in backups (Apple Restore separately)
- Tutorial page for Backup & Restore

Do not mark complete until device verification.

### Stage 10 — Release

- Store assets
- Privacy and support pages
- Release builds
- Post-MVP: See Future Features.

---

## High-Level Architecture

Stack: React Native + Expo (TypeScript), React Navigation (not Expo Router).

### Current app structure

```
App.tsx                 # SafeAreaProvider + Data + Theme + Entitlement + Navigation + Tutorial
src/
  navigation/           # Root stack (Main tabs + Paywall modal) + tab stacks
  screens/              # Home, Library, History, Settings, Paywall (+ editors)
  entitlement/          # Trial/purchase access model + provider
  iap/                  # expo-iap adapter (store builds)
  config/               # App brand + centralized store product IDs
  components/           # Shared UI (incl. ThemePicker)
  constants/            # Static labels/defaults (incl. retention options)
  theme/                # Theme registry, provider, layout tokens, themes/*
  config/               # App brand (QuickCal) identity
  types/                # Domain TypeScript models
  data/
    database/           # open, schema, migrate, mappers
    repositories/       # LibraryItem, DailyLogEntry, Settings, Entitlement
    images/             # Persist/delete library photos
    backup/             # Local ZIP export/import (no entitlement)
    library/            # Pin-limit helpers
    logging/            # Active day, totals, log create/undo helpers
    history/            # Retention purge helpers
    erase/              # Erase All Data (preserves purchase_state)
    seed/               # Dev-only seed catalog (gated by __DEV__)
    DataProvider.tsx    # DB init, seed, retention cleanup, refresh signal
```

### SQLite schema (Stage 4)

| Table | Purpose |
|-------|---------|
| `library_items` | Unified user library (Quick Log or Portion mode) |
| `daily_log_entries` | Per-day logged intake snapshots |
| `settings` | Single-row app settings |
| `entitlement` | Trial clock + store purchase cache (not erased / not backed up) |

Legacy notes:
- Pre-v3 `foods` / `meals` / `meal_items` are migrated into `library_items` then dropped.
- Legacy `profile` table may still exist; unused by product UI. Backup may round-trip it if present.
- Historical log `source_type` values `food` / `meal` / `quick` remain; new library logs use `library`.

Relationships:
- `daily_log_entries.source_id` may reference a library item id (or legacy food/meal id); not enforced as FK so history survives library deletes

Schema defaults chosen for open product questions:
- IDs: TEXT UUIDs
- Portion: REAL (unit deferred)
- Macros: nullable REAL
- Images: local filesystem path TEXT
- `settings.history_retention`: NULL = unlimited

Logical layers for later stages:

```
┌─────────────────────────────────────────────┐
│                 Presentation                │
│  Home · Library · History · Settings (UI)   │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│              Application / Domain           │
│  Log meal · Log portion · Library CRUD      │
│  Daily totals · Trial / entitlement checks  │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│              Local Data Layer               │
│  Foods · Meals · Log entries · App settings │
│  (SQLite — Stage 3)                         │
└─────────────────────────────────────────────┘

Optional (purchase only):
┌─────────────────────────────────────────────┐
│     Store billing (Apple / Google)          │
│     Restore purchases · entitlement flag    │
└─────────────────────────────────────────────┘
```

### Suggested domain concepts

| Concept        | Role |
|----------------|------|
| **Food**       | Single ingredient/item with calorie density (per unit). |
| **Meal**       | Named set of foods + portions; one-tap log target. |
| **LogEntry**   | Timestamped record of calories (from meal or food+portion). |
| **DaySummary** | Derived total(s) for a calendar day. |
| **Entitlement**| Trial window and purchase unlock state. |

### Architectural principles

- **Offline-first:** UI and domain never depend on network for logging.
- **Local source of truth:** device database is canonical for MVP.
- **Thin UI:** screens call use-cases/services; calorie math lives in domain, not widgets.
- **Deterministic totals:** recalculate from log entries; avoid divergent cached totals without a clear rule.
- **Platform billing isolated:** purchase code behind a small entitlement port so core app stays testable offline.

### Tech shape

- **UI framework:** React Native + Expo (TypeScript) — decided
- **Navigation:** React Navigation bottom tabs — decided
- **Local DB:** SQLite via `expo-sqlite` — decided (Stage 4)

---

## Questions That Still Need Decisions

### Product

1. **Platforms for v1?** iOS only, Android only, or both from day one?
2. **Macros in MVP?** Calories-only vs calories + protein/carbs/fat.
3. **Portion model?** Grams only, servings, custom units, or mix?
4. **Meal logging semantics?** Always “now”, or pick meal slot / time?
5. **Trial length?** e.g. 7 / 14 / 30 days — and what is locked after trial?
6. **Price point?** One-time purchase amount and regional strategy.
7. **What exactly is gated?** Full lock vs library unlimited but logging capped, etc.
8. **Daily goal in MVP?** Simple calorie target or defer to post-MVP.
9. **Timezone / day boundary?** Midnight local only, or user-defined day start (e.g. 4am)?

### Design / UX

10. **Home layout?** Grid of pinned meals vs ranked list vs both.
11. **Minimum taps budget?** Concrete targets (e.g. pinned meal = 1 tap; new ingredient log ≤ 3).
12. **Dark mode?** System-only, or defer.
13. ~~**Brand name locked?**~~ Resolved for product UI: **QuickCal** (subtitle: Calorie Counter) via `src/config/appBrand.ts`.

### Technical

14. ~~**Framework?**~~ Resolved: React Native + Expo (TypeScript).
15. ~~**Persistence?**~~ Resolved: SQLite via `expo-sqlite` + repository layer.
16. **IAP approach?** RevenueCat vs StoreKit/Play Billing direct.
17. **Trial implementation?** Store free trial of non-consumable vs app-managed first-launch timer (implications for reinstall abuse).
18. ~~**Identifiers?**~~ Resolved for v1 schema: TEXT UUIDs (`crypto.randomUUID` when available).
19. **Migration policy?** How schema changes ship after 1.0 beyond `PRAGMA user_version` migrations.
20. **Testing bar for MVP?** Unit-only vs + a few integration/UI tests.

### Legal / store

21. **Privacy policy & support URL** before store submission.
22. **Analytics?** None (preferred for philosophy) vs minimal crash reporting only.
23. **Data deletion** expectations if export/backup is added later.

---

## Success Criteria (MVP)

- User can create a personal library and log a pinned meal in one tap.
- User can log an ingredient with portion entry without leaving the core flow for long.
- App works with airplane mode on for all logging and library use.
- UI stays minimal; no shared food search.
- Trial → one-time purchase path is understandable and functional on target store(s).

---

## Document control

| Field   | Value                                      |
|---------|--------------------------------------------|
| Status  | Stage 4 database layer implemented         |
| Created | 2026-08-01                                 |
| Code    | Expo app + UI shell + SQLite data layer    |
