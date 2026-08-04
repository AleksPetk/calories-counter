# QuickCal Reference Foods — data source

## Source

- **Provider:** U.S. Department of Agriculture, Agricultural Research Service — [FoodData Central](https://fdc.nal.usda.gov/)
- **Data type:** SR Legacy (final Standard Reference release)
- **Release:** April 2018
- **License:** CC0 1.0 Universal (public domain). No permission required for use; USDA requests attribution.

## Attribution

U.S. Department of Agriculture, Agricultural Research Service. FoodData Central, 2018. https://fdc.nal.usda.gov/.

## Packaging

- Curated subset ships offline as `referenceFoods.v1.json` (≈150 raw / uncooked / dry ingredients).
- Values are **per 100 g** from USDA nutrient numbers: Energy (208), Protein (203), Carbohydrate by difference (205), Total lipid (204).
- Each item stores `fdcId` and the original USDA `description` for traceability.
- No runtime network calls. No Open Food Facts. No invented nutrition values.

## Regeneration

1. Download SR Legacy JSON from FoodData Central download page.
2. Unzip into `scripts/reference-data/sr_legacy/`.
3. Run `python3 scripts/reference-data/curate_reference_foods.py`.
4. Review `scripts/reference-data/curation-report.json` and the generated JSON.
5. Do not commit the full USDA dump (large); only the curated JSON ships with the app.

## Product scope

Natural / minimally processed ingredients only (raw meat, fish, eggs, dry grains/legumes, raw produce, raw/dry nuts & seeds). Packaged labeled foods and cooked preparations are excluded.
