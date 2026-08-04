import type { UnitPref } from './types';

/**
 * Default units for a brand-new Calorie Planner (no saved answers yet).
 * Always metric (kg, cm). Existing saved `unitPref` is never overwritten by this.
 */
export function defaultUnitPrefForNewPlan(): UnitPref {
  return 'metric';
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches - feet * 12);
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

export function kgToLb(kg: number): number {
  return kg / 0.45359237;
}

export function lbToKg(lb: number): number {
  return lb * 0.45359237;
}

export function formatHeightDisplay(heightCm: number, unitPref: UnitPref): string {
  if (unitPref === 'metric') {
    return `${Math.round(heightCm)} cm`;
  }
  const { feet, inches } = cmToFeetInches(heightCm);
  return `${feet}'${inches}"`;
}

export function formatWeightDisplay(weightKg: number, unitPref: UnitPref): string {
  if (unitPref === 'metric') {
    return `${Math.round(weightKg * 10) / 10} kg`;
  }
  return `${Math.round(kgToLb(weightKg) * 10) / 10} lb`;
}
