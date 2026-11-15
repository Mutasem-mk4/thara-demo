// SPDX-License-Identifier: Apache-2.0
// Codex assistance is acknowledged in docs/AI_DISCLOSURE.md and ai-usage.json.
export const PARAMETERS = ['T2M', 'T2M_MAX', 'T2M_MIN', 'PRECTOTCORR'] as const;
export type Parameter = typeof PARAMETERS[number];
export type Point = { latitude: number; longitude: number };
export type DateWindow = { start: string; end: string };
export type DailyRecord = { date: string; values: Record<Parameter, number | null> };
export type PowerResponse = {
  header: { fill_value: number; time_standard: string; start: string; end: string; sources: string[]; api: { version: string } };
  geometry: { coordinates: number[] };
  parameters: Record<Parameter, { units: string; longname: string }>;
  properties: { parameter: Record<Parameter, Record<string, unknown>> };
};
export type Evidence = { raw: PowerResponse; request_url: string; retrieved_at: string; sha256?: string; file?: string };
export type ClimateBundle = { records: DailyRecord[]; evidence: Evidence[]; mode: 'saved' | 'live'; fallback: boolean };
export type Statistic = { value: number | null; valid: number; expected: number; coverage: number; status: 'complete' | 'partial' | 'unavailable'; conflicts: string[] };
export type WindowSummary = { window: DateWindow; days: string[]; statistics: Record<Parameter, Statistic>; trace: DailyRecord[] };
export const REFERENCE_POINT: Point = { latitude: 32.16, longitude: 35.62 };

export class ClimateDataError extends Error {}

export function utcDate(iso: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new ClimateDataError('invalid_dates');
  const timestamp = Date.parse(`${iso}T00:00:00Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== iso) throw new ClimateDataError('invalid_dates');
  return timestamp;
}

// Inclusive boundaries, leap days and year crossings use UTC calendar days, not civil-time offsets.
export function windowDays(window: DateWindow): string[] {
  const start = utcDate(window.start);
  const end = utcDate(window.end);
  const count = (end - start) / 86_400_000 + 1;
  if (count <= 0 || count > 731) throw new ClimateDataError('invalid_dates');
  return Array.from({ length: count }, (_, index) => new Date(start + index * 86_400_000).toISOString().slice(0, 10));
}

function keyToDate(key: string): string {
  const iso = `${key.slice(0, 4)}-${key.slice(4, 6)}-${key.slice(6, 8)}`;
  utcDate(iso);
  return iso;
}

function isObject(candidate: unknown): candidate is Record<string, unknown> {
  return typeof candidate === 'object' && candidate !== null;
}

export function parsePower(candidate: unknown): PowerResponse {
  if (!isObject(candidate)) throw new ClimateDataError('invalid_source');
  const { header, properties, parameters, geometry } = candidate;
  if (!isObject(header) || !isObject(properties) || !isObject(parameters) || !isObject(geometry)) throw new ClimateDataError('invalid_source');
  if (!isObject(properties.parameter) || !Array.isArray(geometry.coordinates) || geometry.coordinates.length < 2 || !geometry.coordinates.every(Number.isFinite)) throw new ClimateDataError('invalid_source');
  if (!Number.isFinite(header.fill_value) || header.time_standard !== 'LST' || !Array.isArray(header.sources) || !header.sources.every(source => typeof source === 'string')) throw new ClimateDataError('invalid_metadata');
  if (!isObject(header.api) || typeof header.api.version !== 'string' || typeof header.start !== 'string' || typeof header.end !== 'string') throw new ClimateDataError('invalid_metadata');
  if (!/^\d{8}$/.test(header.start) || !/^\d{8}$/.test(header.end)) throw new ClimateDataError('invalid_metadata');
  keyToDate(header.start);
  keyToDate(header.end);
  for (const parameter of PARAMETERS) {
    const definition = parameters[parameter];
    if (!isObject(definition) || definition.units !== (parameter === 'PRECTOTCORR' ? 'mm/day' : 'C') || typeof definition.longname !== 'string' || !isObject(properties.parameter[parameter])) throw new ClimateDataError('invalid_units');
  }
  return candidate as PowerResponse;
}

function sourceValue(raw: PowerResponse, parameter: Parameter, key: string): number | null {
  const reading = raw.properties.parameter[parameter][key];
  if (typeof reading !== 'number' || !Number.isFinite(reading) || reading === raw.header.fill_value) return null;
  if (parameter === 'PRECTOTCORR' && reading < 0) return null;
  return reading;
}

export function sourceRecords(raw: PowerResponse): DailyRecord[] {
  const keys = new Set(PARAMETERS.flatMap(parameter => Object.keys(raw.properties.parameter[parameter])));
  return [...keys].sort().map(key => {
    if (!/^\d{8}$/.test(key)) throw new ClimateDataError('invalid_source_date');
    const date = keyToDate(key);
    const values = Object.fromEntries(PARAMETERS.map(parameter => [parameter, sourceValue(raw, parameter, key)])) as DailyRecord['values'];
    return { date, values };
  });
}

function uniqueReading(records: DailyRecord[], parameter: Parameter): { value: number | null; conflict: boolean } {
  const readings = [...new Set(records.map(record => record.values[parameter]).filter(reading => reading !== null))];
  return { value: readings.length === 1 ? readings[0] : null, conflict: readings.length > 1 };
}

function aggregate(parameter: Parameter, readings: number[]): number | null {
  if (!readings.length) return null;
  if (parameter === 'T2M_MAX') return Math.max(...readings);
  if (parameter === 'T2M_MIN') return Math.min(...readings);
  const sum = readings.reduce((total, reading) => total + reading, 0);
  return parameter === 'T2M' ? sum / readings.length : sum;
}

function statisticForWindow(request: { days: string[]; grouped: Map<string, DailyRecord[]>; parameter: Parameter }): Statistic {
  const { days, grouped, parameter } = request;
  const unique = days.map(date => ({ date, ...uniqueReading(grouped.get(date) ?? [], parameter) }));
  const readings = unique.flatMap(reading => reading.value === null ? [] : [reading.value]);
  return {
    value: aggregate(parameter, readings), valid: readings.length, expected: days.length, coverage: readings.length / days.length,
    status: readings.length === days.length ? 'complete' : readings.length ? 'partial' : 'unavailable',
    conflicts: unique.filter(reading => reading.conflict).map(reading => reading.date),
  };
}

export function summarizeWindow(records: DailyRecord[], window: DateWindow): WindowSummary {
  const days = windowDays(window);
  const grouped = new Map<string, DailyRecord[]>();
  for (const record of records) grouped.set(record.date, [...(grouped.get(record.date) ?? []), record]);
  const statistics = Object.fromEntries(PARAMETERS.map(parameter => [parameter, statisticForWindow({ days, grouped, parameter })])) as Record<Parameter, Statistic>;
  const trace = days.map(date => ({ date, values: Object.fromEntries(PARAMETERS.map(parameter => [parameter, uniqueReading(grouped.get(date) ?? [], parameter).value])) as DailyRecord['values'] }));
  return { window, days, statistics, trace };
}

export function requestUrl(point: Point, window: DateWindow): string {
  const query = new URLSearchParams({ parameters: PARAMETERS.join(','), community: 'AG', longitude: String(point.longitude), latitude: String(point.latitude), start: window.start.replaceAll('-', ''), end: window.end.replaceAll('-', ''), format: 'JSON', 'time-standard': 'LST' });
  return `https://power.larc.nasa.gov/api/temporal/daily/point?${query}`;
}

function matchesPoint(raw: PowerResponse, point: Point): boolean {
  return Math.abs(raw.geometry.coordinates[0] - point.longitude) < 0.000001 && Math.abs(raw.geometry.coordinates[1] - point.latitude) < 0.000001;
}

export function sourceCoverage(evidence: Evidence[], point: Point, window: DateWindow): boolean {
  const dates = new Set(evidence.filter(source => matchesPoint(source.raw, point)).flatMap(source => windowDays({ start: keyToDate(source.raw.header.start), end: keyToDate(source.raw.header.end) })));
  return windowDays(window).every(date => dates.has(date));
}

async function savedEvidence(signal: AbortSignal): Promise<Evidence[]> {
  return Promise.all([2024, 2025].map(async year => {
    const prefix = `${import.meta.env.BASE_URL}data/power-${year}`;
    const [rawResponse, provenanceResponse] = await Promise.all([fetch(`${prefix}-raw.json`, { signal }), fetch(`${prefix}-provenance.json`, { signal })]);
    if (!rawResponse.ok || !provenanceResponse.ok) throw new ClimateDataError('saved_unavailable');
    const raw = parsePower(await rawResponse.json());
    const provenance = await provenanceResponse.json();
    if (typeof provenance.request_url !== 'string' || typeof provenance.retrieved_at !== 'string') throw new ClimateDataError('invalid_metadata');
    return { raw, request_url: provenance.request_url, retrieved_at: provenance.retrieved_at, sha256: provenance.sha256, file: `data/power-${year}-raw.json` };
  }));
}

async function liveEvidence(request: { point: Point; window: DateWindow; signal: AbortSignal }): Promise<Evidence> {
  const url = requestUrl(request.point, request.window);
  const response = await fetch(url, { signal: AbortSignal.any([request.signal, AbortSignal.timeout(12_000)]) });
  if (!response.ok) throw new ClimateDataError(`http_${response.status}`);
  const raw = parsePower(await response.json());
  if (!matchesPoint(raw, request.point) || raw.header.start !== request.window.start.replaceAll('-', '') || raw.header.end !== request.window.end.replaceAll('-', '')) throw new ClimateDataError('request_mismatch');
  return { raw, request_url: url, retrieved_at: new Date().toISOString() };
}

export async function loadClimate(request: { point: Point; window: DateWindow; preferLive: boolean; signal: AbortSignal }): Promise<ClimateBundle> {
  windowDays(request.window);
  if (!Number.isFinite(request.point.latitude) || !Number.isFinite(request.point.longitude) || Math.abs(request.point.latitude) > 90 || Math.abs(request.point.longitude) > 180) throw new ClimateDataError('invalid_location');
  if (request.preferLive) {
    try {
      const evidence = await liveEvidence(request);
      return { evidence: [evidence], records: sourceRecords(evidence.raw), mode: 'live', fallback: false };
    } catch (error) {
      if (request.signal.aborted) throw error;
      if (!(error instanceof ClimateDataError || error instanceof TypeError || error instanceof SyntaxError || error instanceof DOMException)) throw error;
    }
  }
  const evidence = await savedEvidence(request.signal);
  if (!sourceCoverage(evidence, request.point, request.window)) throw new ClimateDataError('not_covered');
  return { evidence, records: evidence.flatMap(source => sourceRecords(source.raw)), mode: 'saved', fallback: request.preferLive };
}
