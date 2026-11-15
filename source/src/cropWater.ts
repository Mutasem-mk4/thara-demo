// SPDX-License-Identifier: Apache-2.0
// Estimated crop evapotranspiration under FAO standard conditions, not a soil-water balance.
import { utcDate, windowDays } from './climate';
import { coefficientForDay, cropProfile, seasonLength, type CropProfile } from './cropProfiles';
import type { ReferenceDay } from './eto';
import { REFERENCE_YEARS } from './history';
import { buildWaterCalendar, volumePerTurn, type SupplyInput } from './waterPlan';

export type SeasonOption = { id: string; crop: string; planting: string };
export type WaterInput = {
  area: string; weekdays: number[]; supply: SupplyInput; efficiencyMode: 'gross' | 'adjusted'; efficiencyPercent: string;
};
export type Range = { median: number; minimum: number; maximum: number; count: number };
export type SeasonYear = {
  year: number; dates: string[]; eto: (number | null)[]; etc: (number | null)[];
  rain: (number | null)[]; maxima: (number | null)[]; valid: number; expected: number;
};
export type WaterInterval = { from: string; to: string; days: number; need: Range | null; ratio: number | null };
export type SeasonWeek = { start: string; end: string; days: number; need: Range | null; supply: number | null; ratio: number | null };
export type SeasonAnalysis = {
  option: SeasonOption; profile: CropProfile; end: string; years: SeasonYear[]; includedYears: number[];
  total: Range | null; rain: Range | null; heatDays: Range | null; heatYears: number;
  weeks: SeasonWeek[]; intervals: WaterInterval[]; peak: WaterInterval | null;
  grossPerTurn: number | null; comparedPerTurn: number | null; efficiency: number | null;
  initialDaysOutsideTurns: number; finalDaysOutsideTurns: number;
};

export function addDays(date: string, days: number) {
  return new Date(utcDate(date) + days * 86_400_000).toISOString().slice(0, 10);
}

export function distribution(values: number[]): Range | null {
  if (!values.length) return null;
  const ordered = [...values].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  const median = ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
  return { median, minimum: ordered[0], maximum: ordered[ordered.length - 1], count: ordered.length };
}

export function suppliedDepth(water: WaterInput) {
  const area = Number(water.area);
  const volume = volumePerTurn(water.supply);
  const depth = volume !== null && water.area.trim() && Number.isFinite(area) && area > 0 ? volume / area : null;
  const gross = depth !== null && Number.isFinite(depth) ? depth : null;
  const percent = Number(water.efficiencyPercent);
  const efficiency = water.efficiencyMode === 'adjusted' && water.efficiencyPercent.trim() && Number.isFinite(percent) && percent > 0 && percent <= 100 ? percent / 100 : null;
  const compared = water.efficiencyMode === 'gross' ? gross : gross !== null && efficiency !== null ? gross * efficiency : null;
  return { gross, compared, efficiency };
}

function historicalSeason(option: SeasonOption, profile: CropProfile, year: number, weather: Map<string, ReferenceDay>): SeasonYear {
  const start = `${year}${option.planting.slice(4)}`;
  const length = seasonLength(profile);
  let dates: string[];
  try {
    dates = windowDays({ start, end: addDays(start, length - 1) });
  } catch {
    // A planned February 29 has no matching start in a non-leap reference year.
    dates = [];
  }
  const rows = dates.map(date => weather.get(date));
  const eto = rows.map(row => row?.eto ?? null);
  const etc = eto.map((reading, index) => {
    const coefficient = coefficientForDay(profile, index);
    return reading === null || coefficient === null ? null : reading * coefficient;
  });
  return { year, dates, eto, etc, rain: rows.map(row => row?.values.PRECTOTCORR ?? null),
    maxima: rows.map(row => row?.values.T2M_MAX ?? null), valid: eto.filter(reading => reading !== null).length, expected: length };
}

function completeSum(values: (number | null)[]): number | null {
  if (!values.length || values.some(value => value === null)) return null;
  const sum = (values as number[]).reduce((total, value) => total + value, 0);
  return Number.isFinite(sum) ? sum : null;
}

function rangeForDays(years: SeasonYear[], offset: number, count: number) {
  return distribution(years.flatMap(year => {
    const values = year.etc.slice(offset, offset + count);
    const sum = values.length === count ? completeSum(values) : null;
    return sum === null ? [] : [sum];
  }));
}

function coverage(supply: number | null, need: Range | null) {
  return supply === null || !need || need.median <= 0 ? null : supply / need.median;
}

function modelResult(option: SeasonOption, profile: CropProfile, years: SeasonYear[], includedYears: number[], water: WaterInput): SeasonAnalysis {
  const length = seasonLength(profile);
  const end = addDays(option.planting, length - 1);
  const included = years.filter(year => includedYears.includes(year.year));
  const depth = suppliedDepth(water);
  const turns = buildWaterCalendar({ start: option.planting, end }, water.weekdays, water.supply)?.dates ?? [];
  const intervals: WaterInterval[] = turns.slice(1).map((to, index) => {
    const from = turns[index];
    const offset = (utcDate(from) - utcDate(option.planting)) / 86_400_000;
    const days = (utcDate(to) - utcDate(from)) / 86_400_000;
    const need = rangeForDays(included, offset, days);
    return { from, to, days, need, ratio: coverage(depth.compared, need) };
  });
  const weeks: SeasonWeek[] = Array.from({ length: Math.ceil(length / 7) }, (_, index) => {
    const offset = index * 7, days = Math.min(7, length - offset);
    const start = addDays(option.planting, offset), finish = addDays(start, days - 1);
    const need = rangeForDays(included, offset, days);
    const turnCount = turns.filter(turn => turn >= start && turn <= finish).length;
    const supply = !water.weekdays.length || depth.compared === null ? null : turnCount * depth.compared;
    return { start, end: finish, days, need, supply, ratio: coverage(supply, need) };
  });
  const peak = intervals.reduce<WaterInterval | null>((current, interval) =>
    interval.need && (!current?.need || interval.need.median > current.need.median) ? interval : current, null);
  const rain = distribution(included.flatMap(year => {
    const sum = completeSum(year.rain);
    return sum === null ? [] : [sum];
  }));
  const heatCounts = included.map(year => year.maxima.filter(value => value !== null && value > 35).length);
  return {
    option, profile, end, years, includedYears, total: rangeForDays(included, 0, length), rain,
    heatDays: distribution(heatCounts), heatYears: heatCounts.filter(count => count > 0).length,
    weeks, intervals, peak, grossPerTurn: depth.gross, comparedPerTurn: depth.compared, efficiency: depth.efficiency,
    initialDaysOutsideTurns: turns.length ? (utcDate(turns[0]) - utcDate(option.planting)) / 86_400_000 : length,
    finalDaysOutsideTurns: turns.length ? (utcDate(end) - utcDate(turns[turns.length - 1])) / 86_400_000 + 1 : 0,
  };
}

export function analyzeOptions(options: SeasonOption[], weather: Map<string, ReferenceDay>, water: WaterInput): SeasonAnalysis[] {
  const seasons = options.map(option => {
    const profile = cropProfile(option.crop);
    if (!profile) throw new Error('unknown_crop');
    utcDate(option.planting);
    return { option, profile, years: REFERENCE_YEARS.map(year => historicalSeason(option, profile, year, weather)) };
  });
  const modeled = seasons.filter(season => season.profile.model);
  const commonYears = REFERENCE_YEARS.filter(year => modeled.every(season => season.years.some(candidate => candidate.year === year && candidate.valid === candidate.expected)));
  return seasons.map(({ option, profile, years }) => {
    const included = profile.model ? commonYears : years.filter(year => year.valid === year.expected).map(year => year.year);
    return modelResult(option, profile, years, included, water);
  });
}
