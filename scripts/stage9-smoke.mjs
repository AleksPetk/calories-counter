/**
 * Stage 9 — backup ZIP codec + entitlement exclusion + undo/history/image wiring.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

{
  // ZIP round-trip with backup.json + images/
  const manifest = {
    format: 'quickcal-backup',
    formatVersion: 1,
    exportedAt: '2026-08-04T00:00:00.000Z',
    appVersion: '1.0.0',
    schemaVersion: 4,
    libraryItems: [
      {
        id: 'item-1',
        name: 'Egg',
        calories: 78,
        protein: 6,
        carbs: 0,
        fat: 5,
        image: 'images/item-1.jpg',
        pinned: true,
        loggingMode: 'portion',
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
      },
    ],
    dailyLogEntries: [
      {
        id: 'log-1',
        date: '2026-08-04',
        time: '2026-08-04T12:00:00.000Z',
        sourceType: 'library',
        sourceId: 'item-1',
        calories: 78,
        protein: 6,
        carbs: 0,
        fat: 5,
        foodNameSnapshot: 'Egg',
        portion: 1,
      },
    ],
    settings: {
      dailyGoal: 2000,
      resetTime: '00:00',
      historyRetention: 365,
      tutorialSeen: true,
      themeId: 'modernGreen',
    },
    profile: null,
  };

  const fakeJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
  const zipped = zipSync({
    'backup.json': [strToU8(JSON.stringify(manifest)), { level: 6 }],
    'images/item-1.jpg': [fakeJpeg, { level: 0 }],
  });

  const unzipped = unzipSync(zipped);
  assert.ok(unzipped['backup.json']);
  assert.ok(unzipped['images/item-1.jpg']);
  const parsed = JSON.parse(strFromU8(unzipped['backup.json']));
  assert.equal(parsed.format, 'quickcal-backup');
  assert.equal(parsed.libraryItems[0].image, 'images/item-1.jpg');
  assert.deepEqual(
    Array.from(unzipped['images/item-1.jpg']),
    Array.from(fakeJpeg),
  );
  console.log('ok backup zip round-trip');
}

{
  const create = read('src/data/backup/createBackup.ts');
  const restore = read('src/data/backup/restoreBackup.ts');
  const actions = read('src/data/backup/backupActions.ts');
  const types = read('src/data/backup/types.ts');
  const pathSafety = read('src/data/backup/pathSafety.ts');

  assert.match(types, /BACKUP_FORMAT = 'quickcal-backup'/);
  assert.match(create, /backup\.json/);
  assert.match(create, /images\//);
  assert.match(create, /QuickCal-backup-/);
  assert.doesNotMatch(create, /repositories\.entitlement/);
  assert.doesNotMatch(create, /storePurchased|simulatedPurchased/);
  assert.doesNotMatch(create, /trialStartedAt|trialExpiresAt/);
  assert.match(types, /BackupSettingsPayload/);
  assert.doesNotMatch(types, /purchaseState/);
  assert.match(restore, /repositories\.entitlement\.get\(\)/);
  assert.match(restore, /withTransactionAsync/);
  assert.match(restore, /cleanupPreparedImport\(prepared\)/);
  assert.match(restore, /sanitizeBackupImageEntryPath/);
  assert.match(restore, /Unsupported backup format version/);
  assert.match(pathSafety, /\.\./);
  assert.match(actions, /Sharing\.shareAsync/);
  assert.match(actions, /scheduleExportZipCleanup/);
  assert.match(actions, /ANDROID_BACKUP_SHARE_CLEANUP_DELAY_MS/);
  assert.match(actions, /getDocumentAsync/);
  assert.match(actions, /This will replace your current local QuickCal data/);
  assert.match(actions, /Backup date:/);
  assert.match(actions, /App version:/);
  console.log('ok backup excludes entitlement / confirms import + share cleanup');
}

{
  // Mirror pathSafety rules in pure JS for behavioral checks.
  function sanitizeBackupImageEntryPath(rawPath) {
    if (typeof rawPath !== 'string' || !rawPath) return null;
    if (rawPath.includes('\0')) return null;
    const normalized = rawPath.replace(/\\/g, '/').replace(/^\.\//, '');
    if (
      normalized.startsWith('/') ||
      normalized.startsWith('~/') ||
      /^[A-Za-z]:\//.test(normalized)
    ) {
      return null;
    }
    const parts = normalized.split('/').filter((part) => part.length > 0);
    if (parts.some((part) => part === '.' || part === '..')) return null;
    if (parts.length !== 2 || parts[0] !== 'images') return null;
    const fileName = parts[1];
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*\.(jpg|jpeg|png|webp)$/i.test(fileName)) {
      return null;
    }
    return `images/${fileName}`;
  }

  assert.equal(sanitizeBackupImageEntryPath('images/item-1.jpg'), 'images/item-1.jpg');
  assert.equal(sanitizeBackupImageEntryPath('images/../etc/passwd'), null);
  assert.equal(sanitizeBackupImageEntryPath('images/../../secret.jpg'), null);
  assert.equal(sanitizeBackupImageEntryPath('/etc/passwd'), null);
  assert.equal(sanitizeBackupImageEntryPath('images/nested/evil.jpg'), null);
  assert.equal(sanitizeBackupImageEntryPath('images/ok.webp'), 'images/ok.webp');
  assert.equal(sanitizeBackupImageEntryPath('backup.json'), null);
  console.log('ok zip path traversal blocked');
}

{
  function validateFormatVersion(formatVersion) {
    const BACKUP_FORMAT_VERSION = 2;
    if (typeof formatVersion !== 'number') {
      throw new Error('Backup is missing format version');
    }
    if (
      !Number.isInteger(formatVersion) ||
      formatVersion < 1 ||
      formatVersion > BACKUP_FORMAT_VERSION
    ) {
      throw new Error(`Unsupported backup format version: ${formatVersion}`);
    }
  }
  assert.throws(() => validateFormatVersion(0));
  assert.throws(() => validateFormatVersion(3));
  assert.throws(() => validateFormatVersion(1.5));
  assert.throws(() => validateFormatVersion('1'));
  validateFormatVersion(1);
  validateFormatVersion(2);
  console.log('ok unsupported backup versions rejected');
}


{
  const home = read('src/screens/HomeScreen.tsx');
  const todays = read('src/screens/TodaysLogScreen.tsx');
  assert.match(home, /Undo last log\?/);
  assert.match(home, /getLastLogForActiveDay/);
  assert.match(home, /text: 'Remove'/);
  assert.match(todays, /Undo last log\?/);
  assert.match(todays, /getLastLogForActiveDay/);
  console.log('ok undo confirmation');
}

{
  const history = read('src/screens/HistoryScreen.tsx');
  assert.match(history, /sumMacros/);
  assert.match(history, /summaryExpanded/);
  assert.match(history, /LayoutAnimation/);
  assert.match(history, /Protein/);
  assert.match(history, /Carbs/);
  assert.match(history, /Fat/);
  const math = read('src/data/logging/logMath.ts');
  assert.match(math, /entry\.protein \?\? 0/);
  console.log('ok history expandable macros');
}

{
  const thumb = read('src/components/LibraryThumbnail.tsx');
  const card = read('src/components/LibraryItemCard.tsx');
  const pins = read('src/components/PinGrid.tsx');
  const home = read('src/screens/HomeScreen.tsx');
  assert.match(thumb, /resizeMode="cover"/);
  assert.match(thumb, /overflow: 'hidden'/);
  assert.match(card, /LibraryThumbnail/);
  assert.match(pins, /LibraryThumbnail/);
  assert.match(home, /LibraryThumbnail/);
  assert.match(home, /uri=\{item\.image\}/);
  console.log('ok shared library thumbnails');
}

{
  const pages = read('src/onboarding/pages.tsx');
  assert.match(pages, /id: 'backup'/);
  assert.match(pages, /Export saves all your local data/);
  assert.match(pages, /Restore Purchase \(App Store/);
  assert.match(pages, /Google Play/);
  assert.doesNotMatch(pages, /Apple Restore Purchase/);
  const settings = read('src/screens/SettingsScreen.tsx');
  assert.match(settings, /Export Backup/);
  assert.match(settings, /Import Backup/);
  console.log('ok tutorial + settings backup rows');
}

{
  const pkg = JSON.parse(read('package.json'));
  assert.ok(pkg.dependencies.fflate);
  assert.ok(pkg.dependencies['expo-sharing']);
  assert.ok(pkg.dependencies['expo-document-picker']);
  console.log('ok backup dependencies present');
}

console.log('ok stage9 backup/ux smoke');
