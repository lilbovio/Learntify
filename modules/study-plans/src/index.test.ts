import { expect, it } from 'vitest';
import { StudyPlan, type PlanRecord } from './index';
const record: PlanRecord = {
  id: crypto.randomUUID(),
  ownerId: 'alice',
  slug: 'learn-js',
  title: ' Learn JS ',
  description: '',
  weeklyMinutes: 120,
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
it('encapsulates its data and protects learning goal invariants independently of HTTP', () => {
  const source = { ...record };
  const plan = new StudyPlan(source);
  source.title = 'Changed outside';
  plan.toJSON().title = 'Changed snapshot';
  expect(plan.toJSON().title).toBe('Learn JS');
  for (const patch of [
    { title: ' ' },
    { weeklyMinutes: 14 },
    { weeklyMinutes: 15.5 },
    { description: 'x'.repeat(2001) },
    { slug: 'Invalid Slug' },
    { ownerId: '' },
  ])
    expect(() => new StudyPlan({ ...record, ...patch })).toThrow('Invalid study plan');
});
