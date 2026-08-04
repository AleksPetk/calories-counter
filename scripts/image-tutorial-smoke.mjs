/**
 * Image optimization smoke checks.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

{
  const optimize = readFileSync(
    join(root, 'src/data/images/optimizeLocalImage.ts'),
    'utf8',
  );
  assert.match(optimize, /OPTIMIZED_IMAGE_SIZE = 512/);
  assert.match(optimize, /OPTIMIZED_JPEG_COMPRESS = 0\.82/);
  assert.match(optimize, /SaveFormat\.JPEG/);
  assert.match(optimize, /centerSquareCrop|originX/);

  const library = readFileSync(
    join(root, 'src/data/images/libraryImages.ts'),
    'utf8',
  );
  assert.match(library, /optimizeLocalImage/);

  const pkg = JSON.parse(
    readFileSync(join(root, 'package.json'), 'utf8'),
  );
  assert.ok(pkg.dependencies['expo-image-manipulator']);
}

{
  const pages = readFileSync(join(root, 'src/onboarding/pages.tsx'), 'utf8');
  assert.match(pages, /ONBOARDING_PAGES/);
  assert.match(pages, /Quick Log/);
  assert.match(pages, /Portion/);
  assert.match(pages, /Themes/);
  assert.match(pages, /Backup & Restore|id: 'backup'/);
  assert.match(pages, /Export saves all your local data/);
  const modal = readFileSync(
    join(root, 'src/onboarding/OnboardingModal.tsx'),
    'utf8',
  );
  assert.match(modal, /Start Using QuickCal/);
  assert.match(modal, /pagingEnabled/);
  assert.doesNotMatch(
    readFileSync(join(root, 'App.tsx'), 'utf8'),
    /TutorialProvider|SpotlightOverlay/,
  );
  assert.doesNotMatch(
    readFileSync(join(root, 'App.tsx'), 'utf8'),
    /from '\.\/src\/tutorial/,
  );
}

console.log('ok image optimize + static onboarding smoke');
