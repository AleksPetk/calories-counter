# QuickCal

A mobile calorie tracking app built for speed.

**QuickCal** (*Calorie Counter*) has no shared food database. You build your own food library, log meals with one tap, and enter ingredients by portion. Everything works offline and is stored on device.

**Core idea:** the fastest path from hunger to logged calories — as few taps as possible.

## Status

In active development (Expo SDK 54 + React Native + TypeScript). Stage 9, Stage A (Calorie Planner), and Stage B (QuickCal Reference Library) are implemented in code and awaiting device verification.

See [PROJECT.md](./PROJECT.md) for vision, MVP scope, architecture, and stages.  
See [DEVELOPMENT.md](./DEVELOPMENT.md) for local seed / reset notes.  
See [src/data/reference/SOURCE.md](./src/data/reference/SOURCE.md) for USDA Reference Library attribution.

## Run

```bash
npm install
npx expo start
```

Open in Expo Go on a device or simulator (native; web SQLite is not the target).
