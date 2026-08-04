import datasetJson from './referenceFoods.v1.json';

import type { ReferenceFood, ReferenceFoodsDataset } from './types';

const dataset = datasetJson as ReferenceFoodsDataset;

export const REFERENCE_FOODS_VERSION = dataset.version;
export const REFERENCE_FOODS_SOURCE = dataset.source;

export function getReferenceDataset(): ReferenceFoodsDataset {
  return dataset;
}

export function getAllReferenceFoods(): ReferenceFood[] {
  return dataset.items;
}

export function getReferenceFoodById(id: string): ReferenceFood | null {
  return dataset.items.find((item) => item.id === id) ?? null;
}

export function getReferenceAttribution(): string {
  return dataset.source.attribution;
}
