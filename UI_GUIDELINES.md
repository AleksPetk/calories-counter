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

### Remaining calorie bar (top)

- Always visible at the top of the Home screen.
- Shows remaining calories relative to the daily goal (exact copy/format TBD — see Open UI Questions).
- **Green** while under (or at) the daily goal.
- **Red** when over the daily goal.
- **Tap the bar** to open **Today’s Log**.
- Bar updates immediately when entries are added, edited, or deleted.

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
- After a successful log, return the input to a ready state for the next entry (exact reset behavior TBD).

### Pinned foods / meals (21)

- Up to **21** pinned foods and/or meals on Home.
- Pins are one-tap log targets (tap = log that item for the current day).
- Layout must favor glanceability and large targets (exact grid vs rows TBD).
- Empty pin slots / empty state should push the user to pin from Library without adding clutter (exact empty UI TBD).

### Search

- Search sits **below** the pinned items.
- Searches the user’s personal library (foods and meals).
- Results support fast logging (and navigation to detail/edit as needed without extra chrome).

### Scroll behavior

- Top region (calorie bar, quick input, pins, search) defines the fixed conceptual hierarchy.
- **Everything below the search can scroll** (search results and any additional list content).
- Scrolling must not hide the ability to get back to logging quickly (exact sticky vs non-sticky chrome TBD).

---

## Library

Personal catalog of foods and meals. Setup cost lives here so Home stays fast.

### Foods

- User-created ingredients/items with calorie data (and macros when provided).
- Create, view, and maintain from Library.
- Support whatever portion/unit model product decides; UI must make units obvious at log time.

### Meals

- Named combinations of foods with portions.
- Built for one-tap reuse from Home when pinned.
- Editing a meal definition should not silently rewrite past log history without a clear rule (see Open UI Questions).

### Pin / unpin

- Any food or meal can be pinned or unpinned.
- Pinning adds it to the Home pin set (subject to the 21 cap).
- Unpinning removes it from Home pins without deleting the library item.
- When the pin limit is reached, the UI must make the limit clear and offer a path to free a slot (exact pattern TBD).

### Images

- Foods and meals may have images.
- Images are optional; lists and pins must remain usable and fast without them.
- Image treatment should stay consistent (size, crop, placeholder) across Library and pins.

### Search

- Library has its own search over foods and meals.
- Same minimal, fast interaction language as Home search where possible.

### Edit / Delete

- Edit food or meal details (name, nutrition, image, composition for meals).
- Delete with a clear confirmation when the action is destructive.
- Deleting should define what happens to pins and future logging; past entries policy TBD.

---

## Today’s Log

Opened from the Home calorie bar (and any other approved entry points). Shows what was logged for the current day (respecting day reset time from Settings).

### Timeline

- Chronological list of foods/meals eaten for today.
- Each row shows enough to identify the entry and its calorie impact at a glance.
- Order and time display rules TBD (newest first vs chronological ascending).

### Edit / Delete

- Every entry can be edited or deleted.
- Edit returns the user to a focused editor, not a maze of screens.
- Delete is immediate in effect after confirmation (confirmation strictness TBD for mis-taps).

### Instant recalculation

- Totals (and remaining-vs-goal on Home) update as soon as an entry changes.
- No manual refresh. No stale totals after navigation back to Home.

### Macros

- If an entry has protein / carbs / fat, show them.
- If macros are missing, do not invent values; show calories cleanly without empty macro clutter.

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

---

## Settings

### Daily calorie goal

- User sets the daily calorie target used by the Home remaining bar.
- Changing the goal updates remaining-state presentation immediately.

### Day reset time

- Defines when a new “day” starts for logging and the remaining bar.
- **Default: 00:00.**
- User-editable.
- UI must make the active day obvious if reset is not midnight (copy/indicator TBD).

### Tutorial replay

- Access to replay onboarding / tutorial without resetting user data.

### Theme (future)

- Theme controls are reserved for later (e.g. system / light / dark).
- Do not build theme UI until approved; placeholder in this guide only.

### Purchase status

- Show trial / purchased / locked state clearly.
- Path to purchase or restore when applicable.
- No aggressive paywall chrome on primary logging surfaces beyond what product requires.

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

1. **Remaining bar content** — Show remaining only, remaining + goal, consumed / goal, or a visual progress fill? Exact number formatting?
2. **At-goal color** — Treat exact goal as green (under/at) or a distinct state?
3. **Quick log confirm** — Explicit “Log” button vs submit on keyboard “done”? Both?
4. **After quick log** — Clear all fields, keep expanded state, or collapse again?
5. **Optional macro units** — Grams only? Hide macro fields entirely until goal/macros product decision is final?
6. **Pin layout for 21** — Grid dimensions (e.g. 3×7), ordering (manual vs most used), and overflow when fewer than 21?
7. **Pin tap behavior for foods needing portions** — One-tap with default portion, or open portion entry first?
8. **Pin limit UX** — Block with message, force replace, or “choose which to unpin” flow?
9. **Sticky chrome on Home** — Does the calorie bar (and/or quick input) stay fixed while results scroll?
10. **Search results actions** — One-tap log vs open detail; difference between food and meal?
11. **Image source** — Camera, photo library, both; required aspect ratio; can pins show images or icon/color only for speed?
12. **Today’s Log ordering** — Newest first or oldest first? Show timestamps?
13. **Delete confirmation** — Always confirm, or swipe-delete with undo snackbar for speed?
14. **History picker** — Full calendar, vertical day list, or both?
15. **Editing past days from History** — Same screen component as Today’s Log or a separate mode?
16. **Day reset indicator** — How does Home show that “today” started at e.g. 04:00?
17. **Tutorial** — First-run only content outline; modal vs dedicated screens?
18. **Navigation shell** — Tab bar contents and order (Home / Library / History / Settings)?
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
