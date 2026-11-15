import { expect, test } from 'vitest';
import { measurementDocumented, newPlanningContext, reviewOrder } from './planningContext';

test('a reported zero is preserved while unknown and incomplete measurements are not documented', () => {
  const context = newPlanningContext();
  expect(context.soilECe.state).toBe('not_entered');
  const measured = { ...context.soilECe, state: 'measured' as const, value: '0', method: 'Saturated paste extract', date: '2026-11-10', source: 'Synthetic test laboratory', depth: '30' };
  expect(measurementDocumented(measured, 'soil')).toBe(true);
  expect(measurementDocumented({ ...measured, state: 'unknown' }, 'soil')).toBe(false);
  expect(measurementDocumented({ ...measured, depth: '' }, 'soil')).toBe(false);
  expect(measurementDocumented({ ...measured, depth: '' }, 'water')).toBe(true);
  expect(measurementDocumented({ ...measured, date: '2026-02-30' }, 'soil')).toBe(false);
  expect(measurementDocumented({ ...measured, value: '' }, 'soil')).toBe(false);
});

test('priority changes explanation order without adding or removing comparison topics', () => {
  expect(reviewOrder('soil')).toEqual(['soil', 'water', 'risk']);
  expect(reviewOrder('risk')).toEqual(['risk', 'water', 'soil']);
});
