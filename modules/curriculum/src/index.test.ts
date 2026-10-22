import { describe, expect, it } from 'vitest';
import { checkPrediction, firstLessonId, getLesson } from './index';

describe('published starter lesson', () => {
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
