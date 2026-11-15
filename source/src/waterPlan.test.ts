import { expect, test } from 'vitest';
import { buildWaterCalendar, daysBetweenTurns, turnsAroundDate, volumePerTurn } from './waterPlan';

const dates = { start: '2025-01-17', end: '2025-04-16' };

test('changes calculated dates and longest gaps when the availability days change', () => {
  const tueThu = buildWaterCalendar(dates, [2, 4], { mode: 'unknown' });
  expect(tueThu?.dates).toHaveLength(25);
  expect(tueThu?.longestGap).toEqual({ days: 5, from: '2025-01-23', to: '2025-01-28' });
  expect(buildWaterCalendar(dates, [1, 4], { mode: 'unknown' })?.longestGap?.days).toBe(4);
});

test('distinguishes unknown days from zero matches and counts an inclusive leap-day turn once', () => {
  const leapDay = { start: '2024-02-29', end: '2024-02-29' };
  expect(buildWaterCalendar(leapDay, [], { mode: 'unknown' })).toBeNull();
  expect(buildWaterCalendar(leapDay, [2], { mode: 'unknown' })?.dates).toEqual([]);
  expect(buildWaterCalendar(leapDay, [4, 4], { mode: 'unknown' })).toMatchObject({
    dates: ['2024-02-29'], longestGap: null, totalVolume: null,
  });
});

test('converts flow only with complete valid inputs, and preserves a genuine zero', () => {
  expect(volumePerTurn({ mode: 'flow', litresPerSecond: '', hours: '2' })).toBeNull();
  expect(volumePerTurn({ mode: 'flow', litresPerSecond: '2', hours: '25' })).toBeNull();
  expect(volumePerTurn({ mode: 'volume', cubicMetres: '0' })).toBe(0);
  expect(buildWaterCalendar(dates, [2, 4], { mode: 'flow', litresPerSecond: '2', hours: '1' }))
    .toMatchObject({ perTurn: 7.2, totalVolume: 180 });
});

test.each([
  ['2025-01-23', '2025-01-27', ['2025-01-24', '2025-01-25', '2025-01-26']],
  ['2024-02-28', '2024-03-01', ['2024-02-29']],
  ['2025-12-31', '2026-01-01', []],
])('counts only dates without a turn between %s and %s', (from, to, expected) => {
  expect(daysBetweenTurns(from, to)).toEqual(expected);
});

test.each([
  ['2025-01-19', undefined, false, '2025-01-20'],
  ['2025-01-20', undefined, true, '2025-01-22'],
  ['2025-01-21', '2025-01-20', false, '2025-01-22'],
  ['2025-01-22', '2025-01-20', true, undefined],
  ['2025-01-23', '2025-01-22', false, undefined],
])('finds the prior, same-day and next turns around a recorded crop date of %s', (date, before, sameDay, after) => {
  expect(turnsAroundDate(['2025-01-20', '2025-01-22'], date)).toEqual({ before, sameDay, after });
});
