import { describe, expect, it } from 'vitest';
import { checkPrediction, firstLessonId, getLesson, listLessons } from './index';

describe('published starter lesson', () => {
  it('publishes the same ordered curriculum and exercise targets in both languages', () => {
    const english = listLessons('en');
    expect(english.map((lesson) => lesson.id)).toEqual([
      'values-and-expressions',
      'storing-values',
      'working-with-text',
      'comparing-values',
      'making-decisions',
      'repeating-with-loops',
      'writing-functions',
      'collecting-with-arrays',
      'describing-with-objects',
    ]);
    expect(listLessons('es').map((lesson) => lesson.id)).toEqual(
      english.map((lesson) => lesson.id),
    );
    for (const entry of english) {
      const en = getLesson(entry.id, 'en')!;
      const es = getLesson(entry.id, 'es')!;
      expect(es.coding.expectedOutput).toEqual(en.coding.expectedOutput);
      expect(es.title).not.toBe(en.title);
      expect(
        en.exercise.choices.some((choice) => {
          const result = checkPrediction(entry.id, 'en', entry.version, choice.id);
          return result.kind === 'feedback' && result.feedback.correct;
        }),
      ).toBe(true);
    }
  });
  it('preserves exercise identity across languages', () => {
    const english = getLesson(firstLessonId, 'en')!;
    const spanish = getLesson(firstLessonId, 'es')!;
    expect(english.exercise.id).toBe(spanish.exercise.id);
    expect(english.title).not.toBe(spanish.title);
    expect(english.explanation.length).toBe(spanish.explanation.length);
  });
  it('rejects an unknown choice and a stale version rather than marking them wrong', () => {
    expect(checkPrediction(firstLessonId, 'en', 1, 'forged').kind).toBe('invalid-choice');
    expect(checkPrediction(firstLessonId, 'en', 2, 'five').kind).toBe('stale');
  });
  it('explains incorrect predictions without granting mastery', () => {
    const result = checkPrediction(firstLessonId, 'es', 1, 'thirty-two');
    expect(result.kind).toBe('feedback');
    if (result.kind === 'feedback') {
      expect(result.feedback.correct).toBe(false);
      expect(result.feedback.provenance).toBe('practice-feedback');
      expect(result.feedback.explanation).toContain('suma');
    }
  });
});
