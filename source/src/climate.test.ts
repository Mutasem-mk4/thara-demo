import { afterEach, describe, expect, test, vi } from 'vitest';
import raw2024 from '../public/data/power-2024-raw.json';
import raw2025 from '../public/data/power-2025-raw.json';
import provenance2024 from '../public/data/power-2024-provenance.json';
import provenance2025 from '../public/data/power-2025-provenance.json';
import { PARAMETERS, REFERENCE_POINT, loadClimate, parsePower, sourceRecords, summarizeWindow, windowDays, type DailyRecord } from './climate';
import { currentClimate } from './useClimate';
import { initialCase, caseError, measurementComplete } from './case';

// Deliberately synthetic rows for missing/duplicate cases; never labelled as NASA observations.
const syntheticDay = (date: string, rain: number | null): DailyRecord => ({ date, values: { T2M: 20, T2M_MAX: 25, T2M_MIN: 15, PRECTOTCORR: rain } });
const shortWindow = { start: '2024-01-01', end: '2024-01-10' };

function fixtureFetch(input: RequestInfo | URL) {
  const url = String(input);
  if (url.includes('power.larc.nasa.gov')) return Promise.reject(new TypeError('Network disconnected'));
  const year2024 = url.includes('2024');
  const payload = url.includes('provenance') ? (year2024 ? provenance2024 : provenance2025) : (year2024 ? raw2024 : raw2025);
  return Promise.resolve(new Response(JSON.stringify(payload), { status: 200 }));
}

afterEach(() => vi.unstubAllGlobals());

describe('daily climate meaning', () => {
  test.each([
    ['2024-02-28', '2024-03-01', 3], ['2025-02-28', '2025-03-01', 2],
    ['2024-12-20', '2025-01-10', 22], ['2024-01-01', '2024-01-01', 1],
  ])('inclusive calendar %s to %s contains %i days', (start, end, expected) => {
    expect(windowDays({ start, end })).toHaveLength(expected);
  });

  test.each([['2025-02-29', '2025-03-01'], ['2024-02-30', '2024-03-01'], ['2024-02-02', '2024-02-01'], ['', '2024-01-01']])('invalid dates %s to %s are rejected', (start, end) => {
    expect(() => windowDays({ start, end })).toThrow('invalid_dates');
  });

  test('missing rain is not zero and each parameter has its own coverage', () => {
    const rows = [syntheticDay('2024-01-01', 0), syntheticDay('2024-01-02', 3), syntheticDay('2024-01-03', null)];
    const summary = summarizeWindow(rows, { start: '2024-01-01', end: '2024-01-03' });
    expect(summary.statistics.PRECTOTCORR).toMatchObject({ value: 3, valid: 2, expected: 3, status: 'partial', coverage: 2 / 3 });
    expect(summary.statistics.T2M).toMatchObject({ value: 20, valid: 3, status: 'complete' });
    expect(summary.trace[2].values.PRECTOTCORR).toBeNull();
  });

  test('duplicates count once, conflicting readings become missing, outside days are ignored', () => {
    const rows = [syntheticDay('2024-01-01', 1), syntheticDay('2024-01-01', 1), syntheticDay('2024-01-02', 2), syntheticDay('2023-12-31', 100)];
    const window = { start: '2024-01-01', end: '2024-01-02' };
    expect(summarizeWindow(rows, window).statistics.PRECTOTCORR).toMatchObject({ value: 3, valid: 2 });
    const conflicted = summarizeWindow([...rows, syntheticDay('2024-01-01', 4)], window);
    expect(conflicted.statistics.PRECTOTCORR).toMatchObject({ value: 2, valid: 1, status: 'partial', conflicts: ['2024-01-01'] });
    expect(conflicted.statistics.T2M.valid).toBe(2);
  });

  test('no valid readings produce unavailable rather than a zero total', () => {
    expect(summarizeWindow([], shortWindow).statistics.PRECTOTCORR).toMatchObject({ value: null, valid: 0, expected: 10, status: 'unavailable' });
  });

  test('real saved NASA data reproduces the independent ten-day research reference', () => {
    const summary = summarizeWindow(sourceRecords(parsePower(raw2024)), shortWindow);
    expect(summary.statistics.T2M.value).toBeCloseTo(14.849, 8);
    expect(summary.statistics.T2M_MAX.value).toBe(25.85);
    expect(summary.statistics.T2M_MIN.value).toBe(7.95);
    expect(summary.statistics.PRECTOTCORR.value).toBeCloseTo(0.48, 8);
    for (const parameter of PARAMETERS) expect(summary.statistics[parameter].valid).toBe(10);
  });

  test('fill sentinel is read from metadata and unsupported source units are rejected', () => {
    const raw = structuredClone(raw2024);
    raw.header.fill_value = -123;
    raw.properties.parameter.T2M['20240101'] = -123;
    const first = sourceRecords(parsePower(raw))[0];
    expect(first.values.T2M).toBeNull();
    raw.parameters.PRECTOTCORR.units = 'in/day';
    expect(() => parsePower(raw)).toThrow('invalid_units');
  });
});

describe('request and fallback integrity', () => {
  test('network failure uses labelled real saved data for matching dates', async () => {
    vi.stubGlobal('fetch', fixtureFetch);
    const bundle = await loadClimate({ point: REFERENCE_POINT, window: shortWindow, preferLive: true, signal: new AbortController().signal });
    expect(bundle).toMatchObject({ mode: 'saved', fallback: true });
    expect(bundle.evidence[0].retrieved_at).toBe(provenance2024.retrieved_at);
    expect(summarizeWindow(bundle.records, shortWindow).statistics.T2M.value).toBeCloseTo(14.849, 8);
  });

  test.each([
    { point: REFERENCE_POINT, window: { start: '2023-01-01', end: '2023-01-10' } },
    { point: { latitude: 32.2, longitude: 35.62 }, window: shortWindow },
  ])('a failed new request outside saved coverage never returns the old data: %j', async request => {
    vi.stubGlobal('fetch', fixtureFetch);
    await expect(loadClimate({ ...request, preferLive: true, signal: new AbortController().signal })).rejects.toThrow('not_covered');
  });

  test('a result from a previous request is hidden while the new request is unresolved', () => {
    expect(currentClimate({ key: 'old-request', error: 'old-error' }, 'new-request')).toBeUndefined();
  });

  test('unsupported metadata from live NASA falls back instead of being reported as fresh data', async () => {
    vi.stubGlobal('fetch', (input: RequestInfo | URL) => String(input).includes('power.larc.nasa.gov') ? Promise.resolve(new Response(JSON.stringify({ ...raw2024, header: { ...raw2024.header, time_standard: 'UTC' } }))) : fixtureFetch(input));
    const bundle = await loadClimate({ point: REFERENCE_POINT, window: shortWindow, preferLive: true, signal: new AbortController().signal });
    expect(bundle).toMatchObject({ mode: 'saved', fallback: true });
  });
});

test('incomplete soil measurements cannot be presented as fully described records', () => {
  const measurement = { known: true, value: '0', method: 'saturated paste', date: '2026-11-14', source: 'user-entered lab', depth: '' };
  expect(measurementComplete(measurement, 'soil')).toBe(false);
  expect(measurementComplete({ ...measurement, depth: '0–30 cm' }, 'soil')).toBe(true);
});

test('overlapping sequence windows and empty coordinates block new calculations', () => {
  expect(caseError({ ...initialCase, winter: initialCase.summer })).toBe('sequence_dates');
  expect(caseError({ ...initialCase, latitude: '' })).toBe('invalid_location');
});
