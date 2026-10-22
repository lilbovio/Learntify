import { expect, it } from 'vitest';
import { readChoice, saveChoice, localeFromSearch } from './local-choice';
const first = { id: 'first', version: 1, exercise: { choices: [{ id: 'five' }] } };
const second = { id: 'second', version: 1, exercise: { choices: [{ id: 'ten' }] } };
it('isolates choices by lesson and version', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
  expect(saveChoice(storage, first, 'five')).toBe(true);
  expect(readChoice(storage, second)).toBe('');
  expect(saveChoice(storage, second, 'ten')).toBe(true);
  expect(readChoice(storage, first)).toBe('five');
  expect(readChoice(storage, second)).toBe('ten');
  expect(readChoice(storage, { ...first, version: 2 })).toBe('');
  expect(saveChoice(storage, second, 'five')).toBe(false);
});
it('ignores corrupt local state and survives unavailable storage', () => {
  expect(readChoice({ getItem: () => 'forged' }, first)).toBe('');
  expect(
    readChoice(
      {
        getItem: () => {
          throw new Error('unavailable');
        },
      },
      first,
    ),
  ).toBe('');
  expect(
    saveChoice(
      {
        setItem: () => {
          throw new Error('quota');
        },
      },
      first,
      'five',
    ),
  ).toBe(false);
});
it('only accepts supported locales', () => {
  expect(localeFromSearch('?lang=es')).toBe('es');
  expect(localeFromSearch('?lang=unknown')).toBe('en');
});
