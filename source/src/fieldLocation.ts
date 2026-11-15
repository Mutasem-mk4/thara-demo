// SPDX-License-Identifier: Apache-2.0
import { REFERENCE_POINT, type Point } from './climate';

export type LocationChoice = Point & { area?: string };

// Public reference points, not field boundaries. Detail and attribution in THIRD_PARTY.md.
export const areas = [
  { id: 'deir-alla', ar: 'دير علا', en: 'Deir Alla', point: REFERENCE_POINT },
  { id: 'amman', ar: 'عمّان', en: 'Amman', point: { latitude: 31.955, longitude: 35.945 } },
  { id: 'irbid', ar: 'إربد', en: 'Irbid', point: { latitude: 32.556, longitude: 35.85 } },
  { id: 'salt', ar: 'السلط', en: 'As-Salt', point: { latitude: 32.039, longitude: 35.727 } },
  { id: 'zarqa', ar: 'الزرقاء', en: 'Zarqa', point: { latitude: 32.073, longitude: 36.088 } },
  { id: 'madaba', ar: 'مادبا', en: 'Madaba', point: { latitude: 31.716, longitude: 35.794 } },
  { id: 'jerash', ar: 'جرش', en: 'Jerash', point: { latitude: 32.281, longitude: 35.899 } },
  { id: 'ajloun', ar: 'عجلون', en: 'Ajloun', point: { latitude: 32.333, longitude: 35.753 } },
  { id: 'maan', ar: 'معان', en: 'Ma’an', point: { latitude: 30.196, longitude: 35.734 } },
  { id: 'aqaba', ar: 'العقبة', en: 'Aqaba', point: { latitude: 29.527, longitude: 35.008 } },
];
