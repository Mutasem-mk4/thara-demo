import { expect, test } from 'vitest';
import raw2024 from '../public/data/power-2024-raw.json';
import raw2025 from '../public/data/power-2025-raw.json';
import { initialCase } from './case';
import { parsePower, sourceRecords, type ClimateBundle } from './climate';
import { compareWinterTiming } from './timing';

const saved: ClimateBundle = {
  mode: 'saved',
  fallback: false,
  records: [raw2024, raw2025].flatMap(raw => sourceRecords(parsePower(raw))),
  evidence: [raw2024, raw2025].map(raw => ({ raw: parsePower(raw), request_url: '', retrieved_at: '' })),
};

test('the live demo reproduces two equal 90-day NASA windows and their reference values', () => {
  const result = compareWinterTiming(initialCase, saved);
  expect(result.status).toBe('ready');
  if (result.status !== 'ready') return;

  expect(result.shifted.window).toEqual({ start: '2025-02-16', end: '2025-05-16' });
  expect(result.original.days).toHaveLength(90);
  expect(result.shifted.days).toHaveLength(90);
  expect(result.original.statistics.T2M.value).toBeCloseTo(15.17, 2);
  expect(result.shifted.statistics.T2M.value).toBeCloseTo(18.99, 2);
  expect(result.original.statistics.PRECTOTCORR).toMatchObject({ valid: 90, expected: 90, status: 'complete' });
  expect(result.shifted.statistics.PRECTOTCORR).toMatchObject({ valid: 90, expected: 90, status: 'complete' });
  expect(result.original.statistics.PRECTOTCORR.value).toBeCloseTo(68.56, 2);
  expect(result.shifted.statistics.PRECTOTCORR.value).toBeCloseTo(37.43, 2);
});

test('shifting by calendar days preserves duration through February in a leap year', () => {
  const field = {
    ...initialCase,
    summer: { start: '2024-01-01', end: '2024-01-15' },
    winter: { start: '2024-02-01', end: '2024-02-29' },
  };
  const result = compareWinterTiming(field, saved);
  expect(result.status).toBe('ready');
  if (result.status !== 'ready') return;

  expect(result.shifted.window).toEqual({ start: '2024-03-02', end: '2024-03-30' });
  expect(result.shifted.days).toHaveLength(29);
});

test.each([
  [initialCase, { ...saved, evidence: saved.evidence.slice(0, 1) }, 'not_covered'],
  [{ ...initialCase, latitude: '32.20' }, saved, 'not_covered'],
  [{ ...initialCase, winter: { start: '2025-11-10', end: '2025-12-10' } }, saved, 'different_years'],
] as const)('requires complete source date coverage for the same point and a single calendar year %#', (field, bundle, status) => {
  expect(compareWinterTiming(field, bundle)).toEqual({ status });
});
