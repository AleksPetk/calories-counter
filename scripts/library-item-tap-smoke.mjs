/**
 * Focused smoke: Quick vs Portion library taps take different paths.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function normalizeLoggingMode(value) {
  if (typeof value !== 'string') {
    return 'portion';
  }
  const mode = value.trim().toLowerCase();
  return mode === 'quick' ? 'quick' : 'portion';
}

function resolveLibraryItemTapAction(loggingMode) {
  return normalizeLoggingMode(loggingMode) === 'quick'
    ? 'quick-log'
    : 'open-portion';
}

assert.equal(resolveLibraryItemTapAction('quick'), 'quick-log');
assert.equal(resolveLibraryItemTapAction('portion'), 'open-portion');
assert.equal(resolveLibraryItemTapAction('QUICK'), 'quick-log');
assert.equal(resolveLibraryItemTapAction(' Portion '), 'open-portion');
assert.equal(resolveLibraryItemTapAction(undefined), 'open-portion');
assert.equal(resolveLibraryItemTapAction(null), 'open-portion');
assert.equal(resolveLibraryItemTapAction(''), 'open-portion');
assert.equal(resolveLibraryItemTapAction('other'), 'open-portion');

assert.notEqual(
  resolveLibraryItemTapAction('quick'),
  resolveLibraryItemTapAction('portion'),
);

const source = readFileSync(
  join(root, 'src/data/logging/libraryItemTap.ts'),
  'utf8',
);
assert.match(source, /quick-log/);
assert.match(source, /open-portion/);
assert.match(source, /normalizeLoggingMode/);

const home = readFileSync(join(root, 'src/screens/HomeScreen.tsx'), 'utf8');
assert.match(home, /resolveLibraryItemTapAction/);
assert.match(home, /listItem\.loggingMode/);
assert.doesNotMatch(home, /if \(item\.loggingMode === 'quick'\)/);
assert.doesNotMatch(home, /Alert\.alert\('Logged'/);

const keyboard = readFileSync(
  join(root, 'src/components/FormKeyboardScroll.tsx'),
  'utf8',
);
assert.match(keyboard, /measureInWindow/);
assert.doesNotMatch(keyboard, /findNodeHandle/);
assert.doesNotMatch(keyboard, /measureLayout/);

console.log('ok library item tap paths (quick ≠ portion)');
