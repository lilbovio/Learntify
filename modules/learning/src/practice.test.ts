import { expect, it } from 'vitest';
import { reviewDueAt } from './index';

it('schedules a mismatch immediately and a matching output exactly one day later', () => {
  const progress = {
    lessonId: 'lesson',
    lessonVersion: 1,
    attempts: 1,
    matched: false,
    lastPracticedAt: 1000,
  };
  expect(reviewDueAt(progress)).toBe(1000);
  expect(reviewDueAt({ ...progress, matched: true })).toBe(86401000);
});
