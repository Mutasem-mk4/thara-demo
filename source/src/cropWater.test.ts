import { expect, test } from 'vitest';
import raw from '../public/data/power-2015-2024-raw.json';
import { parsePower, sourceRecords } from './climate';
import { analyzeOptions, suppliedDepth, type WaterInput } from './cropWater';
import { coefficientForDay, cropProfile, seasonLength } from './cropProfiles';
import { referenceWeather } from './eto';

const reference = referenceWeather(sourceRecords(parsePower(raw)), 32.16);
const water: WaterInput = { area: '4', weekdays: [0, 4], supply: { mode: 'volume', cubicMetres: '30' }, efficiencyMode: 'gross', efficiencyPercent: '' };
const option = { id: 'first', crop: 'zucchini', planting: '2027-03-01' };

test('Kc reaches its published transition values within a fixed 100-day zucchini scenario', () => {
  const profile = cropProfile('zucchini')!;
  expect(seasonLength(profile)).toBe(100);
  expect(coefficientForDay(profile, 24)).toBe(0.5);
  expect(coefficientForDay(profile, 59)).toBeCloseTo(0.95, 10);
  expect(coefficientForDay(profile, 84)).toBe(0.95);
  expect(coefficientForDay(profile, 99)).toBeCloseTo(0.75, 10);
  expect(coefficientForDay(profile, 100)).toBeNull();
});

test('volume per area remains gross unless an explicit valid efficiency is supplied', () => {
  expect(suppliedDepth(water)).toMatchObject({ gross: 7.5, compared: 7.5, efficiency: null });
  expect(suppliedDepth({ ...water, efficiencyMode: 'adjusted', efficiencyPercent: '80' })).toMatchObject({ compared: 6, efficiency: 0.8 });
  expect(suppliedDepth({ ...water, efficiencyMode: 'adjusted' }).compared).toBeNull();
  expect(suppliedDepth({ ...water, supply: { mode: 'unknown' } }).gross).toBeNull();
  expect(suppliedDepth({ ...water, supply: { mode: 'volume', cubicMetres: '0' } }).gross).toBe(0);
});

test('a Sunday to Thursday interval sums four days and omits the next turn day', () => {
  const result = analyzeOptions([option], reference, water)[0];
  const interval = result.intervals.find(candidate => candidate.from === '2027-03-07')!;
  expect(interval.days).toBe(4);
  expect(interval.to).toBe('2027-03-11');
  const sums = result.years.map(year => year.etc.slice(6, 10).reduce<number>((sum, value) => sum + value!, 0)).sort((a, b) => a - b);
  expect(interval.need?.median).toBeCloseTo((sums[4] + sums[5]) / 2, 10);
  expect(interval.ratio).toBeCloseTo(7.5 / interval.need!.median, 10);
  expect(result.initialDaysOutsideTurns).toBe(3);
});

test('a missing day excludes its reference year from all compared crop scenarios', () => {
  const incomplete = new Map(reference);
  incomplete.set('2018-03-08', { ...incomplete.get('2018-03-08')!, eto: null });
  const results = analyzeOptions([option, { ...option, id: 'second', crop: 'tomato' }], incomplete, water);
  expect(results[0].includedYears).toHaveLength(9);
  expect(results[1].includedYears).toEqual(results[0].includedYears);
  expect(results[0].includedYears).not.toContain(2018);
  expect(results[0].years.find(year => year.year === 2018)?.valid).toBe(99);
});

test('crop, turn-day, quantity and date edits affect their own calculations', () => {
  const base = analyzeOptions([option], reference, water)[0];
  const addedDay = analyzeOptions([option], reference, { ...water, weekdays: [0, 2, 4] })[0];
  const moreWater = analyzeOptions([option], reference, { ...water, supply: { mode: 'volume', cubicMetres: '60' } })[0];
  const tomato = analyzeOptions([{ ...option, crop: 'tomato' }], reference, water)[0];
  const later = analyzeOptions([{ ...option, planting: '2027-05-01' }], reference, water)[0];
  expect(addedDay.peak!.ratio!).toBeGreaterThan(base.peak!.ratio!);
  expect(moreWater.peak!.ratio!).toBeCloseTo(base.peak!.ratio! * 2, 10);
  expect(tomato.years[0].eto.slice(0, 30)).toEqual(base.years[0].eto.slice(0, 30));
  expect(tomato.total?.median).not.toBeCloseTo(base.total!.median, 2);
  expect(later.years[0].eto).not.toEqual(base.years[0].eto);
});

test('cross-year seasons and leap-day plans only use real covered historical dates', () => {
  const winter = analyzeOptions([{ ...option, planting: '2027-12-01' }], reference, water)[0];
  expect(winter.includedYears).toHaveLength(9);
  expect(winter.includedYears).not.toContain(2024);
  const leap = analyzeOptions([{ ...option, planting: '2028-02-29' }], reference, water)[0];
  expect(leap.includedYears).toEqual([2016, 2020, 2024]);
});

test('an unsupported crop returns weather without a water-demand or coverage number', () => {
  const result = analyzeOptions([{ ...option, crop: 'okra' }], reference, water)[0];
  expect(result.total).toBeNull();
  expect(result.peak).toBeNull();
  expect(result.weeks.every(week => week.ratio === null)).toBe(true);
  expect(result.rain?.count).toBe(10);
});
