// SPDX-License-Identifier: Apache-2.0
// Codex assistance is acknowledged in docs/AI_DISCLOSURE.md.
import { windowError, type FieldCase } from './case';
import { sourceCoverage, summarizeWindow, utcDate, type ClimateBundle, type DateWindow, type Point, type WindowSummary } from './climate';

export const TIMING_SHIFT_DAYS = 30;

type TimingResult =
  | { status: 'ready'; original: WindowSummary; shifted: WindowSummary }
  | { status: 'different_years' | 'invalid_window' | 'not_covered' };

export function laterWindow(window: DateWindow): DateWindow {
  const shift = (day: string) => new Date(utcDate(day) + TIMING_SHIFT_DAYS * 86_400_000).toISOString().slice(0, 10);
  return { start: shift(window.start), end: shift(window.end) };
}

export function compareWindowTiming(window: DateWindow, point: Point, bundle: ClimateBundle): TimingResult {
  const shifted = laterWindow(window);
  const year = window.start.slice(0, 4);
  if (![window.end, shifted.start, shifted.end].every(day => day.startsWith(year + '-'))) {
    return { status: 'different_years' };
  }
  if (![window, shifted].every(candidate => sourceCoverage(bundle.evidence, point, candidate))) {
    return { status: 'not_covered' };
  }
  return {
    status: 'ready',
    original: summarizeWindow(bundle.records, window),
    shifted: summarizeWindow(bundle.records, shifted),
  };
}

export function compareWinterTiming(field: Pick<FieldCase, 'latitude' | 'longitude' | 'summer' | 'winter'>, bundle: ClimateBundle): TimingResult {
  if (windowError(field)) return { status: 'invalid_window' };
  const shifted = laterWindow(field.winter);
  if (shifted.end.slice(0, 4) === field.winter.start.slice(0, 4) && windowError({ summer: field.summer, winter: shifted })) {
    return { status: 'invalid_window' };
  }
  return compareWindowTiming(field.winter, { latitude: Number(field.latitude), longitude: Number(field.longitude) }, bundle);
}
