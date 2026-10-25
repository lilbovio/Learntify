import { useEffect, useRef, useState } from 'react';
import { createApiClient } from '@learntify/api-client';
import type { Lesson, Locale, PredictionFeedback } from '@learntify/api-contracts';
import { readChoice, saveChoice } from './local-choice';
import { copy } from '../../shared/copy';
import { CodeExercise } from './CodeExercise';

const api = createApiClient();
export function LessonWorkspace({ lesson, locale }: { lesson: Lesson; locale: Locale }) {
  const text = copy[locale];
  const [choice, setChoice] = useState(() => {
    try {
      return readChoice(localStorage, lesson);
    } catch {
      return '';
    }
  });
  const [feedback, setFeedback] = useState<{ locale: Locale; value: PredictionFeedback }>();
  const [checking, setChecking] = useState(false);
  const [failed, setFailed] = useState(false);
  const [localSaved, setLocalSaved] = useState<boolean>();
  const generation = useRef(0);
  useEffect(() => {
    generation.current++;
    setChecking(false);
    setFailed(false);
    return () => {
      generation.current++;
    };
  }, [locale]);
  async function submit() {
    if (!choice || checking) return;
    const current = generation.current;
    setChecking(true);
    setFailed(false);
    try {
      const value = await api.predict(lesson.id, locale, lesson.version, choice);
      if (current === generation.current) setFeedback({ locale, value });
    } catch {
      if (current === generation.current) setFailed(true);
    } finally {
      if (current === generation.current) setChecking(false);
    }
  }
  function choose(value: string) {
    setChoice(value);
    setFeedback(undefined);
    setFailed(false);
    try {
      setLocalSaved(saveChoice(localStorage, lesson, value));
    } catch {
      setLocalSaved(false);
    }
  }
  const currentFeedback = feedback?.locale === locale ? feedback.value : undefined;
  return (
    <>
      <div className="lesson-meta">
        <span>{text.stage}</span>
        <span>{text.scope}</span>
      </div>
      <h2>{lesson.title}</h2>
      <p className="objective">{lesson.objective}</p>
      <div className="explanation">
        {lesson.explanation.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <pre aria-label="JavaScript">
        <code>{lesson.example}</code>
      </pre>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <fieldset disabled={checking}>
          <legend>{lesson.exercise.prompt}</legend>
          <div className="choices">
            {lesson.exercise.choices.map((option) => (
              <label
                key={option.id}
                className={choice === option.id ? 'choice selected' : 'choice'}
              >
                <input
                  type="radio"
                  name="prediction"
                  value={option.id}
                  checked={choice === option.id}
                  onChange={() => choose(option.id)}
                />
                <code>{option.label}</code>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="practice-actions">
          <button type="submit" disabled={!choice || checking}>
            {checking ? text.checking : text.check}
          </button>
          {localSaved !== undefined && (
            <small role="status">{localSaved ? text.local : text.unsaved}</small>
          )}
        </div>
      </form>
      {failed && <p role="alert">{text.feedbackError}</p>}
      {currentFeedback && (
        <section className="feedback" role="status">
          <h3>{currentFeedback.correct ? text.correct : text.incorrect}</h3>
          <p>{currentFeedback.explanation}</p>
          <h4>{text.reflection}</h4>
          <p>{currentFeedback.nextStep}</p>
        </section>
      )}
      <p className="practice-note">{text.note}</p>
      <CodeExercise lesson={lesson} locale={locale} />
    </>
  );
}
