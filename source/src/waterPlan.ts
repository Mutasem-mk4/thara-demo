// SPDX-License-Identifier: Apache-2.0
import { utcDate, windowDays, type DateWindow } from './climate';

export type SupplyInput =
  | { mode: 'not_entered' }
  | { mode: 'unknown' }
  | { mode: 'volume'; cubicMetres: string }
  | { mode: 'flow'; litresPerSecond: string; hours: string };

const dayMs = 86_400_000;

export function daysBetweenTurns(from: string, to: string) {
  return windowDays({ start: from, end: to }).slice(1, -1);
}

export function turnsAroundDate(turns: readonly string[], date: string) {
  const match = turns.findIndex(turn => turn >= date);
  const index = match === -1 ? turns.length : match;
  const sameDay = turns[index] === date;
  return {
    before: turns[index - 1],
    sameDay,
    after: turns[index + Number(sameDay)],
  };
}

function nonNegative(input: string) {
  const value = Number(input);
  return input.trim() !== '' && Number.isFinite(value) && value >= 0 ? value : null;
}

export function volumePerTurn(input: SupplyInput): number | null {
  if (input.mode === 'unknown' || input.mode === 'not_entered') return null;
  if (input.mode === 'volume') return nonNegative(input.cubicMetres);
  const flow = nonNegative(input.litresPerSecond);
  const hours = nonNegative(input.hours);
  if (flow === null || hours === null || hours > 24) return null;
  const volume = flow * hours * 3.6;
  return Number.isFinite(volume) ? volume : null;
}

export function buildWaterCalendar(window: DateWindow, weekdays: readonly number[], supply: SupplyInput) {
  if (!weekdays.length) return null;
  const included = new Set(weekdays);
  const dates = windowDays(window).filter(date => included.has(new Date(utcDate(date)).getUTCDay()));
  let longestGap: { days: number; from: string; to: string } | null = null;
  for (let index = 1; index < dates.length; index++) {
    const from = dates[index - 1], to = dates[index];
    const days = (utcDate(to) - utcDate(from)) / dayMs;
    if (!longestGap || days > longestGap.days) longestGap = { days, from, to };
  }
  const perTurn = volumePerTurn(supply);
  const totalVolume = perTurn === null ? null : perTurn * dates.length;
  return { dates, longestGap, perTurn, totalVolume: totalVolume !== null && Number.isFinite(totalVolume) ? totalVolume : null };
}
