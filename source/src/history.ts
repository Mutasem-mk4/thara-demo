// SPDX-License-Identifier: Apache-2.0
import { useEffect, useState } from 'react';
import { ClimateDataError, parsePower, requestUrl, sourceRecords, type ClimateBundle, type Evidence, type Point } from './climate';

export const HISTORY_WINDOW = { start: '2015-01-01', end: '2024-12-31' };
export const REFERENCE_YEARS = Array.from({ length: 10 }, (_, index) => 2015 + index);

function checkHistory(evidence: Evidence, point: Point) {
  const { raw } = evidence;
  const [longitude, latitude] = raw.geometry.coordinates;
  if (Math.abs(longitude - point.longitude) > 0.000001 || Math.abs(latitude - point.latitude) > 0.000001
    || raw.header.start !== '20150101' || raw.header.end !== '20241231') throw new ClimateDataError('history_not_covered');
  return evidence;
}

export async function loadHistory(point: Point, savedOnly: boolean, signal: AbortSignal): Promise<ClimateBundle> {
  if (!Number.isFinite(point.latitude) || !Number.isFinite(point.longitude) || Math.abs(point.latitude) > 90 || Math.abs(point.longitude) > 180) throw new ClimateDataError('invalid_location');
  if (!savedOnly) {
    try {
      const request_url = requestUrl(point, HISTORY_WINDOW);
      const response = await fetch(request_url, { signal: AbortSignal.any([signal, AbortSignal.timeout(30_000)]) });
      if (!response.ok) throw new ClimateDataError('history_http_error');
      const evidence = checkHistory({ raw: parsePower(await response.json()), request_url, retrieved_at: new Date().toISOString() }, point);
      return { records: sourceRecords(evidence.raw), evidence: [evidence], mode: 'live', fallback: false };
    } catch (error) {
      if (signal.aborted) throw error;
      if (!(error instanceof ClimateDataError || error instanceof TypeError || error instanceof DOMException || error instanceof SyntaxError)) throw error;
    }
  }
  const prefix = `${import.meta.env.BASE_URL}data/power-2015-2024`;
  const [raw, provenance] = await Promise.all([
    fetch(`${prefix}-raw.json`, { signal }), fetch(`${prefix}-provenance.json`, { signal }),
  ]);
  if (!raw.ok || !provenance.ok) throw new ClimateDataError('history_saved_unavailable');
  const metadata = await provenance.json();
  if (typeof metadata.request_url !== 'string' || typeof metadata.retrieved_at !== 'string') throw new ClimateDataError('invalid_metadata');
  const evidence = checkHistory({ raw: parsePower(await raw.json()), request_url: metadata.request_url,
    retrieved_at: metadata.retrieved_at, sha256: metadata.sha256, file: 'data/power-2015-2024-raw.json' }, point);
  return { records: sourceRecords(evidence.raw), evidence: [evidence], mode: 'saved', fallback: !savedOnly };
}

export function useHistory(point: Point | null, savedOnly: boolean, revision: number) {
  const latitude = point?.latitude, longitude = point?.longitude;
  const key = JSON.stringify([latitude, longitude, savedOnly, revision]);
  const [state, setState] = useState<{ key: string; bundle?: ClimateBundle; error?: string }>({ key: '' });
  useEffect(() => {
    if (latitude === undefined || longitude === undefined) return;
    const controller = new AbortController();
    loadHistory({ latitude, longitude }, savedOnly, controller.signal).then(bundle => {
      if (!controller.signal.aborted) setState({ key, bundle });
    }).catch(error => {
      if (!controller.signal.aborted) setState({ key, error: error instanceof Error ? error.message : 'history_unavailable' });
    });
    return () => controller.abort();
  }, [key, latitude, longitude, savedOnly]);
  const current = state.key === key ? state : undefined;
  return { bundle: current?.bundle, error: current?.error, loading: point !== null && !current };
}
