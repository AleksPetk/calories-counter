# Calories Counter — UI Guidelines

Permanent UI and UX guide for the project. All screens, components, and interaction changes should follow this document. When something is unclear, add or resolve it under **Open UI Questions** — do not invent patterns silently.

---

## Design Philosophy

- **Speed above everything.** The UI exists to shorten the path from intent to logged calories.
- **Every feature should reduce taps or improve accuracy.** If it does neither, it does not ship.
- **Clean, modern, premium look.** Quiet surfaces, clear hierarchy, no decorative noise.
- **No clutter.** One primary job per screen region. Remove anything that does not support logging or review.
- **Minimal text.** Prefer labels users already understand. No long instructions on primary screens.
- **Large touch targets.** Frequent actions (pins, log, expand) must be easy to hit one-handed.
- **Consistent spacing.** Shared spacing scale across screens; aligned edges and equal gaps.
- **Smooth but subtle animations.** Short transitions that confirm state (expand, color change, log). No playful or lengthy motion.

---

## Home Screen

Primary screen. Default landing after launch. Optimized for the fastest possible log.

### Remaining calorie card (top)

- Compact premium card: large remaining number, one goal badge, one linear progress bar.
- No extra calorie statistics on the card (no “X of Y” captions).
- Green/success styling while within goal; danger styling when over.
- Theme-aware surfaces and gradients.
- **Tap the card** to open **Today’s Log** (when logging ships).
- Card updates immediately when entries are added, edited, or deleted.

### Quick calorie input

- Prominent, fast path to log calories without leaving Home.
- Primary field: calorie amount (numeric).
- **Expand arrow** reveals optional fields:
  - Food name
  - Protein
  - Carbs
  - Fat
- Collapsed by default so the common path stays short.
- Confirm/log control must be obvious and reachable without hunting.
- After a successful log, clear fields and keep the form ready for the next entry.

### Pinned foods / meals (21)

- Up to **21** pinned foods and/or meals on Home.
- Pins are one-tap log targets (tap = log that item for the current day).
- Layout: **3-column** compact grid with optional images and theme-aware placeholders.
- Empty pin slots / empty state should push the user to pin from Library without adding clutter (exact empty UI TBD).

### Search

- Search sits **below** the pinned items.
- Searches the user’s personal library (foods and meals).
- Results support fast logging (and navigation to detail/edit as needed without extra chrome).

### Scroll behavior

- Top region (calorie card, quick input, pins, search) defines the fixed conceptual hierarchy.
- **Everything below the search can scroll** (search results and any additional list content).
- Scrolling must not hide the ability to get back to logging quickly (exact sticky vs non-sticky chrome TBD).

---

## Library

Personal catalog of library items. Setup cost lives here so Home stays fast.

### Segments

- **My Library** — user-created foods and meals (existing behavior).
- **QuickCal Reference** — read-only USDA-backed raw / uncooked / dry ingredients (per 100 g). Copy into My Library to edit.
- Compact **Category** selector under search (defaults to All); opens a bottom sheet — not a permanent multi-row chip row.

Segmented control sits under the Library title and above search/list.

### Items

- One unified list (no Foods / Meals tabs).
- Each item has a required logging mode: **Quick Log** or **Portion**.
- Name and calories required; protein, carbs, fat, image, and pin optional.
- Create/edit via a single Add Item form.

### Logging modes

- **Quick Log** — one tap logs saved calories/macros immediately.
- **Portion** — tap opens portion presets (1 / 1.5 / 2) or custom decimal.

### Pin / unpin

- Any item can be pinned or unpinned.
- Pinning adds it to the Home pin set (subject to the 21 cap).
- Cards and pins show a small **Quick** / **Portion** badge.

### Images

- Items may have images.
- Images are optional; lists and pins must remain usable and fast without them.

### Search

- One Library search over all items.

### Edit / Delete

- Edit item details (name, nutrition, mode, image, pin).
- Delete with confirmation.
- Past log snapshots are never rewritten when library items change.

---

## Today’s Log

Opened from the Home calorie card (and any other approved entry points). Shows what was logged for the current day (respecting day reset time from Settings).

### Timeline

- Chronological list (`time` ascending).
- Each row shows name snapshot, calories, portion when applicable, macros when available, and logged time.

### Edit / Delete

- Every entry can be edited or deleted.
- Edit opens a focused editor.
- Delete uses confirmation.
- **Undo last log** is available on Home and Today’s Log for the active day.
- Undo always shows a confirmation dialog (food/meal name, calories, portion when available) with **Cancel** and **Remove**. No automatic undo.

### Instant recalculation

- Totals (and remaining-vs-goal on Home) update as soon as an entry changes.
- No manual refresh. No stale totals after navigation back to Home.

### Macros

- If an entry has protein / carbs / fat, show them.
- If macros are missing, do not invent values; show calories cleanly without empty macro clutter.

### Snapshots

- Log entries store name and nutrition at log time.
- Later library edits do not rewrite history.

---

## History

### Unlimited history

- No arbitrary cap on past days in the product UI.
- Performance of long history is an implementation concern; the UX promise is full access.

### Calendar / day selection

- User can pick a past day (calendar and/or day list — exact control TBD).
- Selected day opens that day’s log in the same interaction language as Today’s Log.

### Edit previous days

- Past days are editable (add / edit / delete entries).
- Changes recalculate that day’s totals immediately.
- Crossing the day-reset boundary must remain understandable when viewing “today” vs calendar dates.

### Day summary card

- Collapsed: day label, date key, calorie total.
- Tap center to expand: Calories, Protein, Carbs, Fat (missing macros count as 0).
- Smooth expand/collapse animation; keep the compact premium card chrome.

---

## Settings

### Daily calorie goal

- User sets the daily calorie target used by the Home remaining bar.
- Optional protein / carbs / fat goals (grams) can be set manually or via Calorie Planner.
- Changing the calorie goal updates remaining-state presentation immediately.
- Home pin grid and remaining card are not redesigned for macros in this stage.

### Calorie Planner

- Settings → Goals & day → **Calorie Planner**.
- Purpose-built questionnaire (not a Profile page).
- User answers questions → sees estimated calories + macros → may **Apply** to daily goals.
- Results stay static until **Recalculate**; answers prefills on reopen.
- Fresh questionnaire defaults to **metric** (kg, cm); saved unit preference is restored on recalculate and via backup.
- Never reads logging history; never auto-adjusts from intake.
- Must show estimate / not-medical-advice / individual-variation messaging.
- Faster weight loss only when BMI ≥ 30 and the target stays above the safety floor.

### Day reset time

- Defines when a new “day” starts for logging and the remaining bar.
- **Default: 00:00.**
- User-editable.
- UI must make the active day obvious if reset is not midnight (copy/indicator TBD).

### Tutorial replay

- Access to replay onboarding / tutorial without resetting user data.
- The single onboarding tutorial must mention that **themes can be changed later in Settings**. Do not create a separate theme tutorial.
- The same tutorial must explain logging modes:
  - **Quick Log** is the fastest option and logs in one tap.
  - **Portion** is more flexible but requires one extra step.
  - Use Quick Log for meals or fixed servings.
  - Use Portion when the amount changes.
- Include a short **Calorie Planner** page: questionnaire → estimates → apply / recalculate; estimates only, not medical advice. Keep it concise — not a legal page.

### Theme

- Users pick from registered visual themes in Settings (swatch picker).
- Selection applies app-wide immediately and persists locally (`settings.theme_id`).
- Default: **Modern Green**.
- Themes change colors/gradients/shadows only — not layout, spacing structure, or behavior.

### Purchase status

- Show trial / purchased / locked state clearly.
- Path to purchase or restore when applicable.
- No aggressive paywall chrome on primary logging surfaces beyond what product requires.

### Backup & Restore

- **Export Backup** creates one local ZIP (`backup.json` + `images/`) and opens the system share sheet (Files / iCloud Drive / AirDrop).
- **Import Backup** picks a ZIP, shows backup date + app version, then confirms: “This will replace your current local QuickCal data.”
- Import replaces library, history, settings (goal / macros / reset / retention / theme / tutorial), Calorie Planner snapshot when present, and images.
- StoreKit purchases / entitlement are **never** exported or imported; restore purchases via Apple Restore Purchase.
- Missing or corrupt images are skipped; import still succeeds for the rest of the data.
- Tutorial includes a Backup & Restore page explaining export, import, and separate purchase restore.

### About

- App name, version, and essential legal/support links as required for store compliance.

---

## UI Rules

1. **Reuse components whenever possible.** Buttons, list rows, search fields, nutrition readouts, empty states, and dialogs should share one system.
2. **Keep screens visually consistent.** Same spacing, typography scale, icon style, and interaction patterns across Home, Library, Log, History, and Settings.
3. **Never redesign an existing screen without approval.** Iterate within this guide; structural redesigns need an explicit decision.
4. **Do not introduce unnecessary navigation.** Prefer sheets, expands, and in-place edits over extra stack screens.
5. **Prefer one-tap actions.** Especially for pinned log and undo of obvious mistakes where safe.
6. **Always optimize for speed.** Before adding UI, ask: does this save taps, prevent errors, or clarify totals? If not, cut it.

### Motion

- Use short, subtle animation for expand/collapse, bar color state, and confirming a log.
- Avoid staggered gimmicks, parallax, and long hero transitions.

### Copy

- Short labels. Prefer verbs on actions (“Log”, “Save”, “Delete”).
- Errors are brief and actionable.

### Touch

- Primary controls sized for reliable thumb use.
- Destructive actions need clear affordance; do not place them where a one-tap log lives.

---

## Open UI Questions

Decisions still needed — do not assume answers in implementation:

1. **Remaining card content** — Resolved for Stage 5.1: remaining number + goal badge + progress bar only (no extra calorie stats).
2. **At-goal color** — Treat exact goal as green (under/at) or a distinct state?
3. **Quick log confirm** — Explicit “Log” button vs submit on keyboard “done”? Both?
4. **After quick log** — Clear all fields, keep expanded state, or collapse again?
5. **Optional macro units** — Grams only? Hide macro fields entirely until goal/macros product decision is final?
6. **Pin layout for 21** — Resolved for Stage 5.1: 3-column compact grid; ordering still TBD (manual vs most used).
7. **Pin tap behavior for foods needing portions** — One-tap with default portion, or open portion entry first?
8. **Pin limit UX** — Block with message, force replace, or “choose which to unpin” flow?
9. **Sticky chrome on Home** — Does the calorie card (and/or quick input) stay fixed while results scroll?
10. **Search results actions** — One-tap log vs open detail; difference between food and meal?
11. **Image source** — Camera, photo library, both; required aspect ratio; can pins show images or icon/color only for speed?
12. **Today’s Log ordering** — Newest first or oldest first? Show timestamps?
13. **Delete confirmation** — Always confirm, or swipe-delete with undo snackbar for speed?
14. **History picker** — Full calendar, vertical day list, or both?
15. **Editing past days from History** — Same screen component as Today’s Log or a separate mode?
16. **Day reset indicator** — How does Home show that “today” started at e.g. 04:00?
17. **Tutorial** — First-run only; must include that themes are changeable in Settings; modal vs dedicated screens still TBD.
18. ~~**Navigation shell**~~ Resolved: bottom tabs in order Home | Library | History | Settings (Home is default).
19. **Paywall placement** — Settings only vs soft gate after trial on log actions?
20. **Empty states** — Exact copy and CTA for no pins, empty library, empty day log?
21. **Accessibility** — Dynamic Type limits, VoiceOver labels for pins and bar, reduced motion behavior?
22. **Safe area / landscape** — Phone portrait primary only for v1, or landscape supported?
23. **Haptics** — Light haptic on successful one-tap log, or none for v1?

---

## Document control

| Field        | Value                          |
|--------------|--------------------------------|
| Status       | Active UI/UX guide             |
| Created      | 2026-08-01                     |
| Code impact  | None until implementation      |
| Authority    | Binding for UI work; open questions block assumptions |
