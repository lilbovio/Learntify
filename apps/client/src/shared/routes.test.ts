import { expect, it } from 'vitest';
import { readRoute, lessonPath } from './routes';
it('resolves localized deep links and rejects unknown routes', () => {
  expect(readRoute('/es/start')).toEqual({ locale: 'es', screen: 'start' });
  expect(readRoute('/en/learn/lessons/storing-values')).toEqual({
    locale: 'en',
    screen: 'lesson',
    lessonId: 'storing-values',
  });
  expect(readRoute('/en/missing').screen).toBe('missing');
  expect(readRoute('/en/learn/lessons/%2F').screen).toBe('missing');
  expect(readRoute('/', '?lang=es')).toEqual({ locale: 'es', screen: 'welcome' });
  expect(lessonPath('es', 'storing-values')).toBe('/es/learn/lessons/storing-values');
});
