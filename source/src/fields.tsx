// SPDX-License-Identifier: Apache-2.0
// Codex assistance is acknowledged in docs/AI_DISCLOSURE.md and ai-usage.json.
import { cloneElement, isValidElement, type ReactNode } from 'react';
import type { Language } from './evidence';
import { initialCase, type FieldCase } from './case';

export type Translate = (ar: string, en: string) => string;
export const translation = (language: Language): Translate => (ar, en) => language === 'ar' ? ar : en;
export function Ltr({ children }: { children: ReactNode }) { return <bdi dir="ltr">{children}</bdi>; }
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  const control = isValidElement<{ 'aria-label'?: string }>(children) ? cloneElement(children, { 'aria-label': label }) : children;
  return <label className="field"><span>{label}</span>{control}{hint && <small>{hint}</small>}</label>;
}
export function CaseEditor({ field, update, t }: { field: FieldCase; update: (next: FieldCase) => void; t: Translate }) {
  return <div className="case-grid">
    <Field label={t('اسم موقع الحالة', 'Case location name')}><input value={field.name === initialCase.name ? '' : field.name} placeholder={t('دير علا', 'Deir Alla')} onInput={event => update({ ...field, name: event.currentTarget.value })} /></Field>
    <Field label={t('نوع الإنتاج', 'Production type')}><select value={field.production} onChange={event => update({ ...field, production: event.currentTarget.value })}><option value="forage">{t('أعلاف، حالة بحثية توضيحية', 'Forage, illustrative research case')}</option><option value="unknown">{t('لا أعرف', 'Unknown')}</option></select></Field>
    <Field label={t('خط العرض', 'Latitude')}><input type="number" step="0.01" min="-90" max="90" dir="ltr" value={field.latitude} onInput={event => update({ ...field, latitude: event.currentTarget.value })} /></Field>
    <Field label={t('خط الطول', 'Longitude')}><input type="number" step="0.01" min="-180" max="180" dir="ltr" value={field.longitude} onInput={event => update({ ...field, longitude: event.currentTarget.value })} /></Field>
  </div>;
}
