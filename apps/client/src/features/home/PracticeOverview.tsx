import { useEffect, useState } from 'react';
import { ApiError, createApiClient } from '@learntify/api-client';
import type { LessonListItem, Locale, PracticeProgress } from '@learntify/api-contracts';
import { lessonPath } from '../../shared/routes';

const api = createApiClient();
export function PracticeOverview({
  locale,
  lessons,
  mode = 'all',
}: {
  locale: Locale;
  lessons: LessonListItem[];
  mode?: 'all' | 'practice' | 'progress';
}) {
  const [rows, setRows] = useState<PracticeProgress[]>();
  const [failed, setFailed] = useState(false);
  const [expired, setExpired] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setFailed(false);
    setExpired(false);
    void api
      .practiceProgress(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setRows(data);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          setFailed(true);
          setExpired(cause instanceof ApiError && cause.status === 401);
          setRows(undefined);
        }
      });
    const refresh = () => setReload((value) => value + 1);
    window.addEventListener('focus', refresh);
    return () => {
      controller.abort();
      window.removeEventListener('focus', refresh);
    };
  }, [reload]);
  const text =
    locale === 'en'
      ? {
          title: 'Your practice',
          loading: 'Loading practice…',
          error: 'Could not load practice.',
          retry: 'Try again',
          empty: 'Run an exercise and save your first attempt to start tracking practice.',
          count: 'Lessons practiced',
          attempts: 'Saved attempts',
          match: 'Latest output matched',
          mismatch: 'Latest output needs another try',
          review: 'Review queue',
          clear: 'No reviews due right now.',
          next: 'Next review',
          note: 'Practice is reported by your browser, not a mastery score. Mismatches are due now; matching results return after one day.',
        }
      : {
          title: 'Tu práctica',
          loading: 'Cargando práctica…',
          error: 'No se pudo cargar la práctica.',
          retry: 'Intentar de nuevo',
          empty: 'Ejecuta un ejercicio y guarda tu primer intento para registrar tu práctica.',
          count: 'Lecciones practicadas',
          attempts: 'Intentos guardados',
          match: 'El último resultado coincidió',
          mismatch: 'El último resultado necesita otro intento',
          review: 'Repasos pendientes',
          clear: 'No tienes repasos pendientes ahora.',
          next: 'Próximo repaso',
          note: 'Tu navegador informa la práctica; no es una puntuación de dominio. Los resultados distintos se repasan ahora; los coincidentes, después de un día.',
        };
  const current = rows?.filter((row) =>
    lessons.some((lesson) => lesson.id === row.lessonId && lesson.version === row.lessonVersion),
  );
  const due = current?.filter((row) => row.due).sort((a, b) => a.reviewDueAt - b.reviewDueAt);
  return (
    <section className="clay-card practice-overview">
      <h2>{text.title}</h2>
      {failed ? (
        <div role="alert">
          <p>
            {expired
              ? locale === 'en'
                ? 'Sign in again to load your practice.'
                : 'Inicia sesión de nuevo para cargar tu práctica.'
              : text.error}
          </p>
          {expired && (
            <a href={`/${locale}/auth`}>{locale === 'en' ? 'Sign in' : 'Iniciar sesión'}</a>
          )}
          <button onClick={() => setReload((n) => n + 1)}>{text.retry}</button>
        </div>
      ) : !current ? (
        <p role="status">{text.loading}</p>
      ) : (
        <>
          <p>
            {text.count}: {current.length} / {lessons.length}
          </p>
          {!current.length && <p>{text.empty}</p>}
          {mode !== 'practice' && (
            <ul>
              {current.map((row) => (
                <li key={row.lessonId}>
                  <a href={lessonPath(locale, row.lessonId)}>
                    {lessons.find((lesson) => lesson.id === row.lessonId)?.title}
                  </a>
                  <p>
                    {text.attempts}: {row.attempts} · {row.matched ? text.match : text.mismatch}
                  </p>
                  {!row.due && (
                    <small>
                      {text.next}: {new Date(row.reviewDueAt).toLocaleString(locale)}
                    </small>
                  )}
                </li>
              ))}
            </ul>
          )}
          {mode !== 'progress' && (
            <>
              <h3>{text.review}</h3>
              {due?.length ? (
                <ol>
                  {due.map((row) => (
                    <li key={row.lessonId}>
                      <a href={lessonPath(locale, row.lessonId)}>
                        {lessons.find((lesson) => lesson.id === row.lessonId)?.title}
                      </a>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>{text.clear}</p>
              )}
            </>
          )}
        </>
      )}
      <p className="practice-note">{text.note}</p>
    </section>
  );
}
