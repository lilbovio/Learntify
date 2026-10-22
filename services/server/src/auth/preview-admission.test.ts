import { expect, it } from 'vitest';
import { parsePreviewEmails, previewAdmission } from './preview-admission';

it('requires a bounded explicit cohort and never treats a domain as admission', () => {
  for (const invalid of [
    undefined,
    '',
    '*',
    '@example.test',
    'a@example.test,',
    'a@example.test\nb@example.test',
    Array.from({ length: 21 }, (_, i) => `person${i}@example.test`).join(','),
  ])
    expect(parsePreviewEmails(invalid)).toBeNull();
  const emails = parsePreviewEmails(' Learner@Example.test,learner@example.test ');
  expect(emails?.size).toBe(1);
  const admit = previewAdmission(emails!);
  expect(admit('LEARNER@example.test')).toBe(true);
  expect(admit('other@example.test')).toBe(false);
});
