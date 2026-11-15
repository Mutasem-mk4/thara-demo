// SPDX-License-Identifier: Apache-2.0
// Codex assistance is acknowledged in docs/AI_DISCLOSURE.md and ai-usage.json.
import { windowDays, type DateWindow } from './climate';
import type { Priority } from './evidence';

export type FieldCase = { name: string; latitude: string; longitude: string; production: string; previous: string; previousUnknown?: boolean; previousDate: string; previousSource: string; priority: Priority; summer: DateWindow; winter: DateWindow };
export const initialCase: FieldCase = {
  name: 'دير علا / Deir Alla', latitude: '32.16', longitude: '35.62', production: 'forage', previous: '', previousDate: '', previousSource: '', priority: 'water',
  summer: { start: '2024-06-01', end: '2024-08-29' }, winter: { start: '2025-01-17', end: '2025-04-16' },
};
export type ConstraintKey = 'baseline' | 'area' | 'water' | 'timing' | 'flow' | 'soil' | 'soilType' | 'drainage' | 'feed' | 'market' | 'capital' | 'labour';
export type ConstraintNote = { known: boolean; text: string; unknown?: boolean };
export type Measurement = { known: boolean; unknown?: boolean; value: string; method: string; date: string; source: string; depth: string };
export type Constraints = { notes: Record<ConstraintKey, ConstraintNote>; soilECe: Measurement; waterECw: Measurement };
const emptyNote = (): ConstraintNote => ({ known: false, text: '' });
const emptyMeasurement = (): Measurement => ({ known: false, value: '', method: '', date: '', source: '', depth: '' });
export const initialConstraints: Constraints = {
  notes: {
    baseline: emptyNote(), area: emptyNote(), water: emptyNote(), timing: emptyNote(), flow: emptyNote(),
    soil: emptyNote(), soilType: emptyNote(), drainage: emptyNote(), feed: emptyNote(),
    market: emptyNote(), capital: emptyNote(), labour: emptyNote(),
  },
  soilECe: emptyMeasurement(), waterECw: emptyMeasurement(),
};

export function windowError({ summer, winter }: Pick<FieldCase, 'summer' | 'winter'>): string | null {
  try {
    windowDays(summer); windowDays(winter);
    if (summer.end >= winter.start) return 'sequence_dates';
    windowDays({ start: summer.start, end: winter.end });
  } catch { return 'invalid_dates'; }
  return null;
}

export function caseError(field: FieldCase): string | null {
  const dates = windowError(field);
  if (dates) return dates;
  if (!field.latitude.trim() || !field.longitude.trim()) return 'invalid_location';
  if (!Number.isFinite(Number(field.latitude)) || !Number.isFinite(Number(field.longitude)) || Math.abs(Number(field.latitude)) > 90 || Math.abs(Number(field.longitude)) > 180) return 'invalid_location';
  return null;
}

export function measurementComplete(measurement: Measurement, kind: 'soil' | 'water'): boolean {
  return measurement.known && measurement.value.trim() !== '' && Number.isFinite(Number(measurement.value)) && Number(measurement.value) >= 0 && Boolean(measurement.method.trim() && measurement.date && measurement.source.trim() && (kind === 'water' || measurement.depth.trim()));
}
