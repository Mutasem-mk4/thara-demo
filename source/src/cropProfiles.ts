// SPDX-License-Identifier: Apache-2.0
// FAO-56 Tables 11 and 12. Values are scenarios pending local calibration.
import type { Language } from './evidence';

export const FAO_COEFFICIENTS = 'https://www.fao.org/4/x0490e/x0490e0b.htm';
export const FAO_HARGREAVES = 'https://www.fao.org/4/x0490e/x0490e07.htm';
export const ROTATION_SOURCE = 'https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/living-soil-healthy-garden';
export const VEGETABLE_SOURCE = 'https://dosweb.dos.gov.jo/DataBank/Agri/Agr_2019.pdf#page=87';
type Words = Record<Language, string>;
export type CropProfile = {
  id: string; name: Words; family: string;
  model: { stages: readonly [number, number, number, number]; kc: readonly [number, number, number]; row: string; region: Words } | null;
};

export const cropProfiles: readonly CropProfile[] = [
  { id: 'zucchini', name: { ar: 'كوسا', en: 'Zucchini' }, family: 'Cucurbitaceae', model: {
    stages: [25, 35, 25, 15], kc: [0.5, 0.95, 0.75], row: '11 · Squash, Zucchini, Apr/Dec; 12 · Squash, Zucchini (initial from Cucurbitaceae group)',
    region: { ar: 'متوسطي / جاف، أبريل أو ديسمبر', en: 'Mediterranean / arid, April or December' },
  } },
  { id: 'cucumber', name: { ar: 'خيار', en: 'Cucumber' }, family: 'Cucurbitaceae', model: {
    stages: [25, 35, 50, 20], kc: [0.6, 1.0, 0.75], row: '11 · Cucumber, Nov/Feb; 12 · Cucumber, Fresh Market',
    region: { ar: 'منطقة جافة، نوفمبر أو فبراير', en: 'Arid region, November or February' },
  } },
  { id: 'tomato', name: { ar: 'بندورة', en: 'Tomato' }, family: 'Solanaceae', model: {
    stages: [30, 40, 45, 30], kc: [0.6, 1.15, 0.9], row: '11 · Tomato, Apr/May, Mediterranean; 12 · Tomato (0.90 chosen from the published end range 0.70–0.90)',
    region: { ar: 'متوسطي، أبريل أو مايو؛ نهاية المعامل 0.90 من نطاق 0.70–0.90', en: 'Mediterranean, April or May; end Kc 0.90 from the 0.70–0.90 range' },
  } },
  { id: 'eggplant', name: { ar: 'باذنجان', en: 'Eggplant' }, family: 'Solanaceae', model: {
    stages: [30, 40, 40, 20], kc: [0.6, 1.05, 0.9], row: '11 · Egg plant, October, Arid Region; 12 · Egg Plant (initial from Solanaceae group)',
    region: { ar: 'منطقة جافة، أكتوبر', en: 'Arid region, October' },
  } },
  { id: 'pepper', name: { ar: 'فلفل حلو', en: 'Sweet pepper' }, family: 'Solanaceae', model: {
    stages: [30, 35, 40, 20], kc: [0.6, 1.05, 0.9], row: '11 · Sweet peppers, Apr/Jun, Europe and Mediterranean (30 chosen from 25/30 initial); 12 · Sweet Peppers',
    region: { ar: 'أوروبا والمتوسط، أبريل / يونيو؛ 30 يومًا للبداية من خيار 25/30', en: 'Europe / Mediterranean, April–June; initial stage 30 from 25/30' },
  } },
  { id: 'potato', name: { ar: 'بطاطا', en: 'Potato' }, family: 'Solanaceae', model: {
    stages: [25, 30, 45, 30], kc: [0.5, 1.15, 0.75], row: '11 · Potato, Jan/Nov, (Semi) Arid (45-day mid scenario); 12 · Potato',
    region: { ar: 'شبه جاف، يناير / نوفمبر؛ اختيار وسط مدته 45 يومًا', en: 'Semi-arid, January / November; 45-day mid-season scenario' },
  } },
  { id: 'green_bean', name: { ar: 'فاصولياء خضراء', en: 'Green bean' }, family: 'Fabaceae', model: {
    stages: [20, 30, 30, 10], kc: [0.5, 1.05, 0.9], row: '11 · Beans (green), Feb/Mar, California/Mediterranean; 12 · Beans, green',
    region: { ar: 'كاليفورنيا / المتوسط، فبراير أو مارس', en: 'California / Mediterranean, February or March' },
  } },
  { id: 'okra', name: { ar: 'بامية، طقس فقط', en: 'Okra, weather only' }, family: 'Malvaceae', model: null },
  { id: 'other', name: { ar: 'محصول آخر، طقس فقط', en: 'Other crop, weather only' }, family: '', model: null },
];

export function cropProfile(id: string) {
  return cropProfiles.find(crop => crop.id === id);
}

export function seasonLength(crop: CropProfile) {
  return crop.model ? crop.model.stages.reduce((sum, days) => sum + days, 0) : 90;
}

export function stageForDay(crop: CropProfile, index: number) {
  if (!crop.model || index < 0 || index >= seasonLength(crop)) return null;
  let boundary = 0;
  for (const [stage, days] of crop.model.stages.entries()) {
    boundary += days;
    if (index < boundary) return stage;
  }
  return null;
}

export function coefficientForDay(crop: CropProfile, index: number): number | null {
  const stage = stageForDay(crop, index);
  if (stage === null || !crop.model) return null;
  const [initial, mid, end] = crop.model.kc;
  const [initialDays, developmentDays, midDays, lateDays] = crop.model.stages;
  if (stage === 0) return initial;
  if (stage === 1) return initial + (mid - initial) * (index - initialDays + 1) / developmentDays;
  if (stage === 2) return mid;
  return mid + (end - mid) * (index - initialDays - developmentDays - midDays + 1) / lateDays;
}
