/**
 * Stage B — QuickCal Reference Library dataset + wiring smoke.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

function scaleReferenceNutrition(item, grams) {
  if (!(grams > 0) || !Number.isFinite(grams)) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
  const scale = grams / 100;
  return {
    calories: Math.round(item.calories * scale * 10) / 10,
    protein: Math.round(item.protein * scale * 10) / 10,
    carbs: Math.round(item.carbs * scale * 10) / 10,
    fat: Math.round(item.fat * scale * 10) / 10,
  };
}

const dataset = JSON.parse(
  read('src/data/reference/referenceFoods.v1.json'),
);

{
  assert.equal(dataset.format, 'quickcal-reference-foods');
  assert.equal(dataset.version, 1);
  assert.ok(dataset.itemCount >= 140 && dataset.itemCount <= 200);
  assert.equal(dataset.itemCount, dataset.items.length);
  assert.match(dataset.source.license, /CC0/i);
  assert.match(dataset.source.url, /fdc\.nal\.usda\.gov/);
}

{
  const ids = new Set();
  const fdcIds = new Set();
  const categories = new Set();
  const states = new Set();
  const cookedRe =
    /\b(cooked|roasted|baked|boiled|fried|grilled|canned|smoked)\b/i;
  const excludedRe =
    /\b(yogurt|yoghurt|cheese|bread|cereal|protein powder|peanut butter|sauce|snack|supplement|beverage|juice)\b/i;

  for (const item of dataset.items) {
    assert.ok(typeof item.id === 'string' && item.id.startsWith('ref_'));
    assert.ok(!ids.has(item.id), `duplicate id ${item.id}`);
    ids.add(item.id);

    assert.ok(Number.isInteger(item.fdcId) && item.fdcId > 0);
    assert.ok(!fdcIds.has(item.fdcId), `duplicate fdc ${item.fdcId}`);
    fdcIds.add(item.fdcId);

    assert.ok(
      ['meat_poultry', 'fish_seafood', 'eggs', 'grains', 'beans_legumes', 'vegetables', 'fruits', 'nuts_seeds'].includes(
        item.category,
      ),
    );
    categories.add(item.category);

    assert.ok(['raw', 'uncooked', 'dry'].includes(item.state));
    states.add(item.state);

    assert.equal(item.servingBasis, 'per_100g');
    assert.ok(typeof item.calories === 'number' && item.calories >= 0);
    assert.ok(typeof item.protein === 'number' && item.protein >= 0);
    assert.ok(typeof item.carbs === 'number' && item.carbs >= 0);
    assert.ok(typeof item.fat === 'number' && item.fat >= 0);
    assert.ok(typeof item.usdaDescription === 'string' && item.usdaDescription);
    assert.equal(item.source, 'sr_legacy');
    assert.equal(item.sourceVersion, '2018-04');

    assert.equal(cookedRe.test(item.usdaDescription), false, item.usdaDescription);
    assert.equal(excludedRe.test(item.usdaDescription), false, item.usdaDescription);
    assert.equal(excludedRe.test(item.displayName), false, item.displayName);
  }

  assert.ok(categories.size === 8);
  assert.ok(states.has('raw'));
}

{
  const chicken = dataset.items.find((i) => i.id.includes('chicken_breast'));
  assert.ok(chicken);
  const scaled = scaleReferenceNutrition(chicken, 150);
  assert.equal(scaled.calories, Math.round(chicken.calories * 1.5 * 10) / 10);
  assert.equal(scaled.protein, Math.round(chicken.protein * 1.5 * 10) / 10);
}

{
  function matchesReferenceQuery(item, query) {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const haystack = [
      item.name,
      item.displayName,
      item.state,
      item.category,
      item.usdaDescription,
    ]
      .join(' ')
      .toLowerCase();
    return q.split(/\s+/).every((token) => haystack.includes(token));
  }
  const hits = dataset.items.filter((i) =>
    matchesReferenceQuery(i, 'raw chicken'),
  );
  assert.ok(hits.length >= 1);
  const veg = dataset.items.filter((i) => i.category === 'vegetables');
  assert.ok(veg.length >= 25);
}

{
  const library = read('src/screens/LibraryScreen.tsx');
  assert.match(library, /My Library/);
  assert.match(library, /QuickCal Reference/);
  assert.match(library, /ReferenceCopy/);
  assert.match(library, /filterReferenceFoods/);
  assert.doesNotMatch(library, /barcode/i);

  const copy = read('src/screens/library/ReferenceCopyScreen.tsx');
  assert.match(copy, /scaleReferenceNutrition/);
  assert.match(copy, /Save to My Library/);
  assert.match(copy, /libraryItems\.create/);

  const nav = read('src/navigation/LibraryNavigator.tsx');
  assert.match(nav, /ReferenceCopy/);

  const backupTypes = read('src/data/backup/types.ts');
  assert.doesNotMatch(backupTypes, /referenceFoods/);
  assert.doesNotMatch(backupTypes, /quickcal-reference/);

  const erase = read('src/data/erase/eraseAllData.ts');
  assert.doesNotMatch(erase, /referenceFoods/);
  assert.match(erase, /libraryItems\.delete/);

  const source = read('src/data/reference/SOURCE.md');
  assert.match(source, /FoodData Central/);
  assert.match(source, /CC0/);

  // Planner untouched by this wiring check
  assert.match(read('src/data/planner/formulas.ts'), /Mifflin/);
}

console.log('reference-library-smoke: ok');
