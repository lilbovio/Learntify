import { expect, it } from 'vitest';
import { readGuestPreferences, saveGuestPreferences } from './preferences';
it('ignores invalid stored preferences and reports failed saves instead of pretending success', () => {
  expect(readGuestPreferences({ getItem: () => '{bad' })).toBeNull();
  expect(
    readGuestPreferences({
      getItem: () => JSON.stringify({ locale: 'es', goal: 'invented', weeklyMinutes: 60 }),
    }),
  ).toBeNull();
  expect(() =>
    saveGuestPreferences(
      {
        setItem: () => {
          throw new Error('blocked');
        },
      },
      { locale: 'en', goal: 'projects', weeklyMinutes: 180 },
    ),
  ).toThrow('blocked');
});
