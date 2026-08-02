/**
 * Active-day / reset-time unit checks (Node).
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function parseResetTime(resetTime) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(resetTime.trim());
  if (!match) return { hours: 0, minutes: 0 };
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return { hours: 0, minutes: 0 };
  }
  return { hours, minutes };
}

function formatLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getActiveDayKey(now, resetTime = '00:00') {
  const { hours, minutes } = parseResetTime(resetTime);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const resetMinutes = hours * 60 + minutes;
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (nowMinutes < resetMinutes) {
    day.setDate(day.getDate() - 1);
  }
  return formatLocalDateKey(day);
}

// Midnight default
{
  const day = new Date(2026, 7, 2, 23, 59, 0);
  assert.equal(getActiveDayKey(day, '00:00'), '2026-08-02');
  const midnight = new Date(2026, 7, 3, 0, 0, 0);
  assert.equal(getActiveDayKey(midnight, '00:00'), '2026-08-03');
}

// Custom reset 04:00
{
  const before = new Date(2026, 7, 2, 3, 59, 0);
  assert.equal(getActiveDayKey(before, '04:00'), '2026-08-01');
  const atReset = new Date(2026, 7, 2, 4, 0, 0);
  assert.equal(getActiveDayKey(atReset, '04:00'), '2026-08-02');
  const after = new Date(2026, 7, 2, 4, 1, 0);
  assert.equal(getActiveDayKey(after, '04:00'), '2026-08-02');
}

// Month boundary before custom reset
{
  const before = new Date(2026, 2, 1, 2, 0, 0);
  assert.equal(getActiveDayKey(before, '04:00'), '2026-02-28');
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'src/data/logging/activeDay.ts'), 'utf8');
assert.match(source, /getActiveDayKey/);

console.log('ok active-day reset-time cases');
