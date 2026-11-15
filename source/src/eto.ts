// SPDX-License-Identifier: Apache-2.0
// FAO-56 equations 21–25 and 52. Codex assisted implementation.
import { summarizeWindow, utcDate, type DailyRecord } from './climate';

export function extraterrestrialRadiation(latitude: number, date: string) {
  if (!Number.isFinite(latitude) || Math.abs(latitude) > 90) throw new Error('invalid_latitude');
  const timestamp = utcDate(date);
  const year = Number(date.slice(0, 4));
  const day = (timestamp - utcDate(`${year}-01-01`)) / 86_400_000 + 1;
  const angle = 2 * Math.PI * day / 365;
  const inverseDistance = 1 + 0.033 * Math.cos(angle);
  const declination = 0.409 * Math.sin(angle - 1.39);
  const phi = latitude * Math.PI / 180;
  const sunsetAngle = Math.acos(Math.max(-1, Math.min(1, -Math.tan(phi) * Math.tan(declination))));
  return Math.max(0, (24 * 60 / Math.PI) * 0.0820 * inverseDistance * (
    sunsetAngle * Math.sin(phi) * Math.sin(declination) + Math.cos(phi) * Math.cos(declination) * Math.sin(sunsetAngle)
  ));
}

export function hargreaves(maximum: number | null, minimum: number | null, radiation: number) {
  if (maximum === null || minimum === null) return null;
  if (![maximum, minimum, radiation].every(Number.isFinite) || maximum < minimum || radiation < 0) return null;
  const mean = (maximum + minimum) / 2; // FAO-56 Eq. 9 standard daily mean.
  const estimate = 0.0023 * (mean + 17.8) * Math.sqrt(maximum - minimum) * 0.408 * radiation;
  return Number.isFinite(estimate) ? Math.max(0, estimate) : null;
}

export type ReferenceDay = DailyRecord & { radiation: number; eto: number | null };

export function referenceWeather(records: DailyRecord[], latitude: number): Map<string, ReferenceDay> {
  const normalized = new Map<string, ReferenceDay>();
  for (let year = 2015; year <= 2024; year++) {
    const summary = summarizeWindow(records, { start: `${year}-01-01`, end: `${year}-12-31` });
    for (const row of summary.trace) {
      const radiation = extraterrestrialRadiation(latitude, row.date);
      const { T2M_MAX, T2M_MIN } = row.values;
      normalized.set(row.date, { ...row, radiation, eto: hargreaves(T2M_MAX, T2M_MIN, radiation) });
    }
  }
  return normalized;
}
