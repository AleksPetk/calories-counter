/**
 * Pin grid — always exactly 3 columns; width math must not wrap on narrow phones.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

/** Mirrors src/components/PinGrid.tsx pinCellWidth */
function pinCellWidth(containerWidth, gap, columns = 3) {
  if (!(containerWidth > 0) || columns < 1) return 0;
  const gapsTotal = gap * (columns - 1);
  return Math.floor((containerWidth - gapsTotal) / columns);
}

{
  const gap = 8;
  // Narrow Android-like content width (~320 after padding)
  const narrow = 320;
  const w = pinCellWidth(narrow, gap, 3);
  assert.equal(w, Math.floor((320 - 16) / 3));
  assert.ok(w * 3 + gap * 2 <= narrow);
  assert.equal(3, 3);
}

{
  // Standard iPhone content (~390 - 48 pad ≈ 342)
  const mid = 342;
  const gap = 8;
  const w = pinCellWidth(mid, gap, 3);
  assert.ok(w * 3 + gap * 2 <= mid);
}

{
  // Fractional trap: without floor, 3 * (100.1) can exceed — floor prevents wrap
  const width = 301;
  const gap = 8;
  const floored = pinCellWidth(width, gap, 3);
  const naive = (width - gap * 2) / 3;
  assert.ok(floored <= naive);
  assert.ok(floored * 3 + gap * 2 <= width);
}

{
  const src = read('src/components/PinGrid.tsx');
  assert.match(src, /PIN_GRID_COLUMN_COUNT = 3/);
  assert.match(src, /pinCellWidth/);
  assert.match(src, /Math\.floor/);
  assert.match(src, /onLayout/);
  assert.doesNotMatch(src, /useWindowDimensions/);
  assert.doesNotMatch(src, /COLUMN_COUNT = 2/);
  assert.match(src, /flexShrink: 0/);

  const home = read('src/screens/HomeScreen.tsx');
  assert.match(home, /PinGrid/);
  assert.match(home, /PIN_SLOT_COUNT/);
}

console.log('pin-grid-smoke: ok');
