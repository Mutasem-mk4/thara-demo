// SPDX-License-Identifier: Apache-2.0
import { utcDate } from './climate';
import type { Language, Priority } from './evidence';

export type PlanningPriority = 'water' | 'soil' | 'risk';
export type AnswerState = 'not_entered' | 'unknown' | 'reported';
export type ContextNote = { state: AnswerState; text: string };
export const contextFields = [
  { id: 'baseline', ar: 'تتابعك الحالي، إذا بتعرفه', en: 'Your current crop sequence, if known', group: 'risk' },
  { id: 'soilType', ar: 'نوع التربة', en: 'Soil type', group: 'soil' },
  { id: 'sampleDepth', ar: 'عمق عينة التربة بالسنتيمتر', en: 'Soil sample depth in centimetres', group: 'soil' },
  { id: 'drainage', ar: 'وضع الصرف', en: 'Drainage condition', group: 'soil' },
  { id: 'waterTiming', ar: 'قيود توقيت الماء داخل أيام الدور', en: 'Water timing constraints within turn days', group: 'water' },
  { id: 'purpose', ar: 'غرض الإنتاج والموعد المطلوب', en: 'Production purpose and required date', group: 'risk' },
  { id: 'market', ar: 'السوق أو المشتري', en: 'Market or buyer', group: 'risk' },
  { id: 'capital', ar: 'الميزانية أو التمويل', en: 'Budget or finance', group: 'risk' },
  { id: 'labour', ar: 'توفر العمالة', en: 'Labour availability', group: 'risk' },
  { id: 'equipment', ar: 'توفر المعدات', en: 'Equipment availability', group: 'risk' },
] as const;
export type ContextKey = typeof contextFields[number]['id'];
export type SalinityRecord = { state: 'not_entered' | 'unknown' | 'measured'; value: string; unit: 'dS/m'; method: string; date: string; source: string; depth: string };
export type PlanningContext = { priority: PlanningPriority; researchPriority: Priority; notes: Record<ContextKey, ContextNote>; soilECe: SalinityRecord; waterECw: SalinityRecord };
export const priorityNames: Record<PlanningPriority, Record<Language, string>> = {
  water: { ar: 'الماء', en: 'Water' }, soil: { ar: 'التربة', en: 'Soil' }, risk: { ar: 'تقليل المخاطر', en: 'Reduce risk' },
};
export function newPlanningContext(): PlanningContext {
  const empty = (): SalinityRecord => ({ state: 'not_entered', value: '', unit: 'dS/m', method: '', date: '', source: '', depth: '' });
  return { priority: 'water', researchPriority: 'water', notes: Object.fromEntries(contextFields.map(field => [field.id, { state: 'not_entered', text: '' }])) as Record<ContextKey, ContextNote>, soilECe: empty(), waterECw: empty() };
}
export function measurementDocumented(record: SalinityRecord, kind: 'soil' | 'water') {
  if (record.state !== 'measured' || !record.value.trim() || !Number.isFinite(Number(record.value)) || Number(record.value) < 0 || record.unit !== 'dS/m') return false;
  if (!record.method.trim() || !record.source.trim() || (kind === 'soil' && (!record.depth.trim() || !Number.isFinite(Number(record.depth)) || Number(record.depth) <= 0))) return false;
  try { utcDate(record.date); } catch { return false; }
  return true;
}
export function reviewOrder(priority: PlanningPriority): PlanningPriority[] {
  return [priority, ...(['water', 'soil', 'risk'] as const).filter(candidate => candidate !== priority)];
}
