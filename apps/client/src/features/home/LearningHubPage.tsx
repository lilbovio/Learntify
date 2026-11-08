import { useEffect, useState } from 'react';
import { createApiClient } from '@learntify/api-client';
import type { LessonListItem, Locale } from '@learntify/api-contracts';
import { PageFrame } from '../../shared/PageFrame';
import { lessonPath } from '../../shared/routes';
import { AccountPanel } from '../account/AccountPanel';
import { PracticeOverview } from './PracticeOverview';

const api = createApiClient();
export function LearningHubPage({
  locale,
  screen,
}: {
  locale: Locale;
  screen: 'learn' | 'practice' | 'progress';
}) {
  const en = locale === 'en';
  const [lessons, setLessons] = useState<LessonListItem[]>();
  const [account, setAccount] = useState<string | null>();
  const [failed, setFailed] = useState(false);
  const [reload, setReload] = useState(0);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'list' | 'map'>('list');
  useEffect(() => {
    const controller = new AbortController();
    setFailed(false);
    void api
      .listLessons(locale, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setLessons(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [locale, reload]);
  const title =
    screen === 'learn'
      ? en
        ? 'Your learning path'
        : 'Tu ruta de aprendizaje'
      : screen === 'practice'
        ? en
          ? 'A little practice goes a long way.'
          : 'Un poco de práctica hace la diferencia.'
        : en
          ? 'See how far you’ve come.'
          : 'Mira cuánto has avanzado.';
  const filtered = lessons
    ?.map((lesson, index) => ({ ...lesson, step: index + 1 }))
    .filter((lesson) =>
      lesson.title.toLocaleLowerCase(locale).includes(query.trim().toLocaleLowerCase(locale)),
    );
  return (
    <PageFrame
      locale={locale}
      eyebrow={
        screen === 'learn'
          ? en
            ? 'Learning path'
            : 'Ruta de aprendizaje'
          : screen === 'practice'
            ? en
              ? 'Practice'
              : 'Práctica'
            : en
              ? 'Progress'
              : 'Progreso'
      }
      title={title}
      lede={
        screen === 'learn'
          ? en
            ? 'Build understanding one idea at a time. Every lesson is free, and you can explore at your own pace.'
            : 'Construye tu comprensión una idea a la vez. Todas las lecciones son gratuitas y puedes explorar a tu ritmo.'
          : en
            ? 'Return to an idea, try it again, and save the evidence of your practice.'
            : 'Vuelve a una idea, inténtalo de nuevo y guarda la evidencia de tu práctica.'
      }
    >
      <AccountPanel locale={locale} onAccountChange={setAccount} unsavedNotes={false} />
      {failed ? (
        <div role="alert" className="callout callout-error">
          <p>{en ? 'Could not load lessons.' : 'No se pudieron cargar las lecciones.'}</p>
          <button onClick={() => setReload((n) => n + 1)}>
            {en ? 'Try again' : 'Intentar de nuevo'}
          </button>
        </div>
      ) : !lessons ? (
        <div className="skeleton-panel" role="status">
          <p>{en ? 'Loading lessons…' : 'Cargando lecciones…'}</p>
        </div>
      ) : (
        <>
          {screen !== 'learn' &&
            (account === undefined ? (
              <p role="status">{en ? 'Loading your account…' : 'Cargando tu cuenta…'}</p>
            ) : account ? (
              <PracticeOverview key={account} locale={locale} lessons={lessons} mode={screen} />
            ) : (
              <section className="clay-card empty-state">
                <span className="stage-label">{en ? 'Your practice' : 'Tu práctica'}</span>
                <h2>{en ? 'Your practice belongs here.' : 'Aquí va tu práctica.'}</h2>
                <p>
                  {en
                    ? 'Sign in to save attempts and see your review queue across devices. You can still explore every lesson without an account.'
                    : 'Inicia sesión para guardar intentos y ver tus repasos en todos tus dispositivos. Puedes explorar todas las lecciones sin una cuenta.'}
                </p>
                <a href={'/' + locale + '/auth'}>{en ? 'Sign in' : 'Iniciar sesión'} →</a>
                <a href={lessonPath(locale)}>{en ? 'Try a lesson' : 'Probar una lección'} →</a>
              </section>
            ))}
          <section
            className="learning-library"
            aria-label={en ? 'Lesson library' : 'Biblioteca de lecciones'}
          >
            <div className="library-heading">
              <div>
                <span className="stage-label">{en ? 'Stage 1' : 'Etapa 1'}</span>
                <h2>{en ? 'JavaScript foundations' : 'Fundamentos de JavaScript'}</h2>
                <p className="lede">
                  {en
                    ? 'Start at 01. Each lesson builds on the idea before it, and you can revisit any step.'
                    : 'Empieza en 01. Cada lección se apoya en la anterior y puedes volver a cualquier paso.'}
                </p>
              </div>
              <div className="view-switch" aria-label={en ? 'Lesson view' : 'Vista de lecciones'}>
                {(['list', 'map'] as const).map((mode) => (
                  <button
                    key={mode}
                    className="secondary-button"
                    aria-pressed={view === mode}
                    onClick={() => setView(mode)}
                  >
                    {mode === 'list' ? (en ? 'List' : 'Lista') : en ? 'Path' : 'Ruta'}
                  </button>
                ))}
              </div>
            </div>
            <label className="lesson-search">
              {en ? 'Search lessons' : 'Buscar lecciones'}
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <p role="status" className="practice-note">
              {filtered?.length} {en ? 'lessons' : 'lecciones'}
            </p>
            <ol className={`library-items library-${view}`}>
              {filtered?.map((lesson, index) => {
                const previous = lessons[lesson.step - 2];
                return (
                  <li key={lesson.id}>
                    <a href={lessonPath(locale, lesson.id)}>
                      <span className="library-step">{String(lesson.step).padStart(2, '0')}</span>
                      <span className="library-copy">
                        <small>
                          {index === 0 && lesson.step === 1
                            ? en
                              ? 'Start here'
                              : 'Empieza aquí'
                            : previous
                              ? en
                                ? `After ${previous.title}`
                                : `Después de ${previous.title}`
                              : en
                                ? 'Builds on the previous idea'
                                : 'Continúa la idea anterior'}
                        </small>
                        <strong>{lesson.title}</strong>
                        <small className="library-meta">
                          {en
                            ? 'Read · Predict · Run · Explain'
                            : 'Lee · Predice · Ejecuta · Explica'}
                        </small>
                      </span>
                      <span className="library-arrow" aria-hidden="true">
                        →
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
            {!filtered?.length && (
              <p>
                {en
                  ? 'No lessons match your search. Try a different word.'
                  : 'No hay lecciones con esa búsqueda. Prueba otra palabra.'}
              </p>
            )}
          </section>
        </>
      )}
    </PageFrame>
  );
}
