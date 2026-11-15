// SPDX-License-Identifier: Apache-2.0
// Codex assistance is acknowledged in docs/AI_DISCLOSURE.md and ai-usage.json.
import { useEffect, useState } from 'react';
import { ClimateDataError, loadClimate, type ClimateBundle, type DateWindow, type Point } from './climate';
import { caseError, type FieldCase } from './case';

type ClimateState = { key: string; bundle?: ClimateBundle; error?: string };

export function currentClimate(state: ClimateState, key: string): ClimateState | undefined {
  return state.key === key ? state : undefined;
}

export function useClimateRequest(point: Point | null, window: DateWindow, preferLive: boolean, revision: number) {
  const latitude = point?.latitude;
  const longitude = point?.longitude;
  const { start, end } = window;
  const key = JSON.stringify([latitude, longitude, start, end, preferLive, revision]);
  const [state, setState] = useState<ClimateState>({ key: '' });
  useEffect(() => {
    if (latitude === undefined || longitude === undefined) return;
    const abort = new AbortController();
    const request = { point: { latitude, longitude }, window: { start, end }, preferLive, signal: abort.signal };
    loadClimate(request).then(bundle => {
      if (!abort.signal.aborted) setState({ key, bundle });
    }).catch(cause => {
      if (!abort.signal.aborted) setState({ key, error: cause instanceof ClimateDataError ? cause.message : 'network_unavailable' });
    });
    return () => abort.abort();
  }, [key, latitude, longitude, start, end, preferLive]);
  const current = currentClimate(state, key);
  return { ...current, loading: point !== null && !current, key };
}

export function useClimate(field: FieldCase, preferLive: boolean, revision: number, enabled = true) {
  const error = enabled ? caseError(field) : null;
  const point = enabled && !error ? { latitude: Number(field.latitude), longitude: Number(field.longitude) } : null;
  const request = useClimateRequest(point, { start: field.summer.start, end: field.winter.end }, preferLive, revision);
  return { ...request, error: error ?? request.error };
}
