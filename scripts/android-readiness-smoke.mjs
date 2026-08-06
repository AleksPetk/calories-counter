/**
 * Android readiness — Stage 1 config / platform safeguards (static checks).
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

{
  const appJson = JSON.parse(read('app.json'));
  const android = appJson.expo.android;
  const plugins = appJson.expo.plugins;

  assert.equal(appJson.expo.version, '1.0.0');
  assert.equal(android.package, 'com.alekspetk.quickcal');
  assert.equal(android.predictiveBackGestureEnabled, false);
  assert.ok(!('versionCode' in android), 'versionCode must stay remote-managed');

  const declared = android.permissions ?? [];
  assert.ok(
    !declared.includes('android.permission.RECORD_AUDIO'),
    'RECORD_AUDIO must not be listed in android.permissions',
  );

  const blocked = android.blockedPermissions ?? [];
  assert.ok(blocked.includes('android.permission.RECORD_AUDIO'));
  assert.ok(blocked.includes('android.permission.CAMERA'));

  const imagePicker = plugins.find(
    (entry) => Array.isArray(entry) && entry[0] === 'expo-image-picker',
  );
  assert.ok(imagePicker, 'expo-image-picker plugin required');
  assert.equal(imagePicker[1].microphonePermission, false);
  assert.equal(imagePicker[1].cameraPermission, false);
  assert.match(imagePicker[1].photosPermission, /photos|foods/i);

  const eas = JSON.parse(read('eas.json'));
  assert.equal(eas.cli.appVersionSource, 'remote');
  assert.equal(eas.build.production.autoIncrement, true);
  assert.ok(
    eas.submit?.production?.ios?.ascAppId,
    'iOS submit config must remain',
  );

  console.log('ok permissions + versioning config');
}

{
  const pages = read('src/onboarding/pages.tsx');
  assert.doesNotMatch(pages, /Apple Restore Purchase/);
  assert.match(pages, /Restore Purchase \(App Store\s*\n\s*or Google Play\)/);

  const guidelines = read('UI_GUIDELINES.md');
  assert.doesNotMatch(guidelines, /Apple Restore Purchase/);
  assert.doesNotMatch(guidelines, /via Apple Restore/);
  assert.match(guidelines, /Restore Purchase/);
  assert.match(guidelines, /App Store or Google Play/);

  const project = read('PROJECT.md');
  assert.doesNotMatch(project, /Apple Restore separately/);
  assert.match(project, /Restore Purchase via App Store or Google Play/);

  console.log('ok platform-neutral purchase / backup copy');
}

{
  const category = read('src/components/ReferenceCategoryPicker.tsx');
  assert.match(category, /useSafeAreaInsets/);
  assert.match(category, /sheetBottomPad/);
  assert.match(category, /Math\.max\(insets\.bottom/);
  assert.match(category, /onRequestClose=\{onClose\}/);

  const portion = read('src/components/PortionPickerSheet.tsx');
  assert.match(portion, /Math\.max\(insets\.bottom/);
  assert.match(portion, /onRequestClose=\{handleCancel\}/);

  const onboarding = read('src/onboarding/OnboardingModal.tsx');
  assert.match(onboarding, /onRequestClose=\{onFinished\}/);
  assert.match(onboarding, /Math\.max\(insets\.bottom/);

  const tabLayout = read('src/navigation/tabBarLayout.ts');
  assert.match(tabLayout, /tabBarTotalHeight/);
  assert.match(tabLayout, /tabBarBottomPad/);

  const rootNav = read('src/navigation/RootNavigator.tsx');
  assert.match(rootNav, /tabBarTotalHeight\(insets\.bottom\)/);
  assert.match(rootNav, /paddingBottom: bottomPad/);

  const planner = read('src/screens/planner/CaloriePlannerScreen.tsx');
  assert.match(planner, /tabBarTotalHeight\(insets\.bottom\)/);
  assert.doesNotMatch(planner, /TAB_BAR_HEIGHT = Platform/);

  console.log('ok bottom inset + tab bar layout');
}

{
  const appNav = read('src/navigation/AppNavigator.tsx');
  assert.match(appNav, /presentation: 'modal'/);
  assert.match(appNav, /gestureEnabled: true/);
  assert.match(appNav, /name="Paywall"/);

  const appJson = JSON.parse(read('app.json'));
  assert.equal(appJson.expo.android.predictiveBackGestureEnabled, false);

  console.log('ok Android back / modal dismiss wiring');
}

{
  const actions = read('src/data/backup/backupActions.ts');
  assert.match(actions, /ANDROID_BACKUP_SHARE_CLEANUP_DELAY_MS = 60_000/);
  assert.match(actions, /scheduleExportZipCleanup/);
  assert.match(actions, /Platform\.OS === 'android'/);
  assert.match(actions, /setTimeout/);
  assert.match(actions, /Sharing\.shareAsync/);
  // Must not delete immediately in a finally without the scheduler.
  assert.match(
    actions,
    /finally \{\s*scheduleExportZipCleanup\(uri\);\s*\}/,
  );
  assert.doesNotMatch(
    actions,
    /finally \{\s*try \{\s*await deleteAsync\(uri/,
  );

  console.log('ok backup share cleanup strategy');
}

console.log('android-readiness-smoke: ok');
