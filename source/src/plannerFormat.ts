import type { Language } from './evidence';

export const number = (value: number, decimals = 1) => value.toLocaleString('en-US', { maximumFractionDigits: decimals });
export function planDate(date: string, language: Language, weekday = false) {
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-JO-u-nu-latn' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', weekday: weekday ? 'long' : undefined, timeZone: 'UTC',
  }).format(new Date(date + 'T00:00:00Z'));
}
