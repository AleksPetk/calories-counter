/**
 * Image optimization + tutorial architecture smoke checks.
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
  const profile = readFileSync(
    join(root, 'src/data/images/profileImages.ts'),
    'utf8',
  );
  assert.match(profile, /optimizeLocalImage/);

  const pkg = JSON.parse(
    readFileSync(join(root, 'package.json'), 'utf8'),
  );
  assert.ok(pkg.dependencies['expo-image-manipulator']);
}

{
  const steps = readFileSync(join(root, 'src/tutorial/steps.ts'), 'utf8');
  assert.match(steps, /TUTORIAL_STEPS/);
  assert.match(steps, /welcome/);
  assert.match(steps, /Themes can be changed/);
  const cleanup = readFileSync(join(root, 'src/tutorial/cleanup.ts'), 'utf8');
  assert.match(cleanup, /tutorial-temp-/);
  assert.match(cleanup, /cleanupTutorialArtifacts/);
  assert.match(cleanup, /ensureTutorialDemoItem/);
  const provider = readFileSync(
    join(root, 'src/tutorial/TutorialProvider.tsx'),
    'utf8',
  );
  assert.match(provider, /SpotlightOverlay/);
  assert.doesNotMatch(
    readFileSync(join(root, 'App.tsx'), 'utf8'),
    /TutorialModal/,
  );
}

console.log('ok image optimize + guided tutorial smoke');
