import { afterEach, expect, test, vi } from 'vitest';
import raw from '../public/data/power-2015-2024-raw.json';
import provenance from '../public/data/power-2015-2024-provenance.json';
import { loadHistory } from './history';

afterEach(() => vi.unstubAllGlobals());

test('a failed live decade request uses a labelled saved response only at its matching point', async () => {
  vi.stubGlobal('fetch', (request: RequestInfo | URL) => {
    const url = String(request);
    if (url.includes('power.larc.nasa.gov')) return Promise.reject(new TypeError('Offline in test'));
    return Promise.resolve(Response.json(url.includes('provenance') ? provenance : raw));
  });
  const signal = new AbortController().signal;
  const saved = await loadHistory({ latitude: 32.16, longitude: 35.62 }, false, signal);
  expect(saved).toMatchObject({ mode: 'saved', fallback: true });
  expect(saved.records).toHaveLength(3653);
  await expect(loadHistory({ latitude: 31.95, longitude: 35.94 }, false, signal)).rejects.toThrow('history_not_covered');
});

test('a successful but wrong-point live response cannot become the new location result', async () => {
  vi.stubGlobal('fetch', (request: RequestInfo | URL) => {
    const url = String(request);
    return Promise.resolve(Response.json(url.includes('provenance') ? provenance : raw));
  });
  await expect(loadHistory({ latitude: 31.95, longitude: 35.94 }, false, new AbortController().signal)).rejects.toThrow('history_not_covered');
});
