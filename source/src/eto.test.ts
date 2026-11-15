import { expect, test } from 'vitest';
import { extraterrestrialRadiation, hargreaves, referenceWeather } from './eto';
import type { DailyRecord } from './climate';

test('radiation reproduces FAO-56 Example 8 at 20 degrees south on September 3', () => {
  expect(extraterrestrialRadiation(-20, '2015-09-03')).toBeCloseTo(32.2, 1);
});

test('Hargreaves converts MJ radiation to equivalent mm exactly once', () => {
  // Manual arithmetic with sqrt(30 - 14) = 4: 0.0023 × 39.8 × 4 × 12.24.
  expect(hargreaves(30, 14, 30)).toBeCloseTo(4.4817984, 7);
  expect(hargreaves(null, 15, 30)).toBeNull();
  expect(hargreaves(10, 15, 30)).toBeNull();
});

test('a conflicting duplicate maximum stays missing in the derived daily ETo', () => {
  const values = { T2M: 20, T2M_MAX: 30, T2M_MIN: 10, PRECTOTCORR: 0 };
  const rows: DailyRecord[] = [
    { date: '2020-02-29', values },
    { date: '2020-02-29', values: { ...values, T2M_MAX: 31 } },
  ];
  const reference = referenceWeather(rows, 32.16);
  expect(reference.get('2020-02-29')?.eto).toBeNull();
  expect(reference.get('2020-02-29')?.values.T2M_MAX).toBeNull();
});
