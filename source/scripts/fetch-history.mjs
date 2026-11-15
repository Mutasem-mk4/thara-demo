// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

const request = new URL('https://power.larc.nasa.gov/api/temporal/daily/point');
request.search = new URLSearchParams({
  parameters: 'T2M,T2M_MAX,T2M_MIN,PRECTOTCORR', community: 'AG', longitude: '35.62', latitude: '32.16',
  start: '20150101', end: '20241231', format: 'JSON', 'time-standard': 'LST',
}).toString();
const response = await fetch(request, { signal: AbortSignal.timeout(60_000) });
if (!response.ok) throw new Error(`NASA HTTP ${response.status}`);
const bytes = Buffer.from(await response.arrayBuffer());
const raw = JSON.parse(bytes.toString('utf8'));
if (raw.header?.start !== '20150101' || raw.header?.end !== '20241231') throw new Error('Unexpected NASA coverage');
const folder = new URL('../public/data/', import.meta.url);
await mkdir(folder, { recursive: true });
const provenance = {
  request_url: request.href, retrieved_at: new Date().toISOString(),
  sha256: createHash('sha256').update(bytes).digest('hex'), response_header: raw.header,
  parameters: raw.parameters, geometry: raw.geometry,
  processing: 'Raw response bytes saved unchanged. No AI-generated values or gap filling.',
};
await writeFile(new URL('power-2015-2024-raw.json', folder), bytes);
await writeFile(new URL('power-2015-2024-provenance.json', folder), JSON.stringify(provenance, null, 2) + '\n');
console.log(JSON.stringify({ bytes: bytes.length, sha256: provenance.sha256, retrieved_at: provenance.retrieved_at,
  days: Object.fromEntries(Object.entries(raw.properties.parameter).map(([key, days]) => [key, Object.keys(days).length])),
}));
