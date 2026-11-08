import { useEffect, useState } from 'react';
import { createApiClient } from '@learntify/api-client';
import type {
  LearningPreferences,
  LessonListItem,
  Locale,
  PracticeProgress,
} from '@learntify/api-contracts';
import { PageFrame } from '../../shared/PageFrame';
import { lessonPath } from '../../shared/routes';
import { readGuestPreferences } from '../onboarding/preferences';
import { AccountPanel } from '../account/AccountPanel';
import { homeCopy } from './copy';
import { PracticeOverview } from './PracticeOverview';

const api = createApiClient();
export function TodayPage({ locale }: { locale: Locale }) {
  const text = homeCopy[locale];
  const en = locale === 'en';
  const [accountId, setAccount] = useState<string | null>(null);
  const [data, setData] = useState<{
    lessons: LessonListItem[];
    preferences: LearningPreferences | null;
    progress: PracticeProgress[];
  }>();
  const [failed, setFailed] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setFailed(false);
    setData(undefined);
    void (async () => {
      try {
        const [lessons, capabilities] = await Promise.all([
          api.listLessons(locale, controller.signal),
          api.capabilities(controller.signal),
        ]);
        const account = capabilities.accounts ? await api.currentAccount(controller.signal) : null;
        let preferences: LearningPreferences | null = null;
        if (account && capabilities.preferences)
          preferences = await api.getPreferences(controller.signal);
        else if (!account) {
          try {
            preferences = readGuestPreferences(localStorage);
          } catch {
            /* Optional guest preferences. */
          }
        }
        const progress =
          account && capabilities.practice
            ? await api.practiceProgress(controller.signal).catch(() => [])
            : [];
        if (!controller.signal.aborted) setData({ lessons, preferences, progress });
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    })();
    return () => controller.abort();
  }, [locale, reload, accountId]);
  const currentProgress = data?.progress.filter((row) =>
    data.lessons.some(
      (lesson) => lesson.id === row.lessonId && lesson.version === row.lessonVersion,
    ),
  );
  const due = currentProgress
    ?.filter((row) => row.due)
    .sort((a, b) => a.reviewDueAt - b.reviewDueAt)[0];
  const nextLesson =
    data?.lessons.find((lesson) => lesson.id === due?.lessonId) ??
    data?.lessons.find((lesson) => !currentProgress?.some((row) => row.lessonId === lesson.id)) ??
    data?.lessons[0];
  const practiced = data?.lessons.filter((lesson) =>
    currentProgress?.some((row) => row.lessonId === lesson.id),
  );
  const upcoming = data?.lessons.filter(
    (lesson) => !currentProgress?.some((row) => row.lessonId === lesson.id),
  );
  return (
    <PageFrame
      locale={locale}
      eyebrow={en ? 'Today' : 'Hoy'}
      title={text.today}
      lede={text.todayIntro}
    >
      <AccountPanel locale={locale} onAccountChange={setAccount} unsavedNotes={false} />
      {failed ? (
        <div role="alert" className="callout callout-error">
          <p>{text.error}</p>
          <button onClick={() => setReload((n) => n + 1)}>{text.retry}</button>
        </div>
      ) : !data ? (
        <div className="skeleton-panel" role="status">
          <p>{text.loading}</p>
        </div>
      ) : (
        <>
          {nextLesson && (
            <section className="clay-card next-action">
              <div>
                <span className="stage-label">
                  {due
                    ? en
                      ? 'Ready for a review'
                      : 'Listo para repasar'
                    : en
                      ? 'A good place to start'
                      : 'Un buen lugar para empezar'}
                </span>
                <h2>{nextLesson.title}</h2>
                <p>
                  {en
                    ? 'Read, predict, and try it in your own code. Take the time you need.'
                    : 'Lee, predice y pruébalo con tu propio código. Tómate el tiempo que necesites.'}
                </p>
              </div>
              <a className="primary-link" href={lessonPath(locale, nextLesson.id)}>
                {en ? 'Open workspace' : 'Abrir espacio de trabajo'} →
              </a>
            </section>
          )}
          <div className="today-grid">
            <section className="clay-card today-preferences">
              <h2>{text.preferences}</h2>
              <p className="today-goal">
                {data.preferences ? text[data.preferences.goal] : text.unknown}
              </p>
              <p>
                {text.rhythm}:{' '}
                {data.preferences?.weeklyMinutes
                  ? `${data.preferences.weeklyMinutes} ${text.minutes}`
                  : text.unset}
              </p>
              <a href={'/' + locale + '/start'}>{text.edit}</a>
            </section>
            <section className="clay-card today-first">
              {!currentProgress?.length ? (
                <>
                  <span className="stage-label">{en ? 'First day' : 'Primer día'}</span>
                  <h2>{en ? 'Nothing is due yet.' : 'Todavía no hay nada pendiente.'}</h2>
                  <p>
                    {en
                      ? 'Start with one lesson. When you save a practice attempt, your review queue will appear here; nothing is scored and no streak is lost.'
                      : 'Empieza con una lección. Cuando guardes un intento, tu cola de repaso aparecerá aquí; nada se puntúa y no se pierde ninguna racha.'}
                  </p>
                  <a href={lessonPath(locale, nextLesson?.id)}>
                    {en ? 'Start the first lesson' : 'Empezar la primera lección'} →
                  </a>
                </>
              ) : (
                <>
                  <span className="stage-label">
                    {en ? 'Your work so far' : 'Tu trabajo hasta ahora'}
                  </span>
                  <h2>{en ? 'Completed practice' : 'Práctica completada'}</h2>
                  <p>
                    {en
                      ? 'Lessons where you saved an attempt. You can reopen any of them without losing your place.'
                      : 'Lecciones donde guardaste un intento. Puedes reabrir cualquiera sin perder tu lugar.'}
                  </p>
                  <ul className="today-list">
                    {practiced?.map((lesson) => (
                      <li key={lesson.id}>
                        <a href={lessonPath(locale, lesson.id)}>{lesson.title}</a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>
          <section className="today-lessons" aria-labelledby="choose-title">
            <div className="section-heading">
              <span className="stage-label">{en ? 'Sequence' : 'Secuencia'}</span>
              <h2 id="choose-title">{text.choose}</h2>
              {currentProgress?.length ? (
                <p className="lede">
                  {en
                    ? `${upcoming?.length ?? 0} lessons are still ahead. Nothing has to be finished today.`
                    : `Quedan ${upcoming?.length ?? 0} lecciones por delante. No tienes que terminar nada hoy.`}
                </p>
              ) : null}
            </div>
            <ol className="lesson-cards">
              {data.lessons.map((lesson, index) => (
                <li key={lesson.id}>
                  <a className="clay-card lesson-card" href={lessonPath(locale, lesson.id)}>
                    <span className="eyebrow">
                      {text.step} {index + 1}
                    </span>
                    <strong>{lesson.title}</strong>
                    {currentProgress?.some((row) => row.lessonId === lesson.id) && (
                      <small>{en ? 'Practiced' : 'Practicada'}</small>
                    )}
                  </a>
                </li>
              ))}
            </ol>
            {accountId ? (
              <PracticeOverview key={accountId} locale={locale} lessons={data.lessons} />
            ) : (
              <p className="practice-note">{text.noMetrics}</p>
            )}
          </section>
        </>
      )}
    </PageFrame>
  );
}
