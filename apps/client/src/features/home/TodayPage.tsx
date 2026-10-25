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
  return (
    <PageFrame locale={locale} title={text.today}>
      <p className="lede">{text.todayIntro}</p>
      <AccountPanel locale={locale} onAccountChange={setAccount} unsavedNotes={false} />
      {failed ? (
        <div role="alert">
          <p>{text.error}</p>
          <button onClick={() => setReload((n) => n + 1)}>{text.retry}</button>
        </div>
      ) : !data ? (
        <p role="status">{text.loading}</p>
      ) : (
        <>
          {nextLesson && (
            <section className="clay-card next-action">
              <div>
                <span className="stage-label">
                  {due
                    ? locale === 'en'
                      ? 'Ready for a review'
                      : 'Listo para repasar'
                    : locale === 'en'
                      ? 'An idea to explore'
                      : 'Una idea para explorar'}
                </span>
                <h2>{nextLesson.title}</h2>
                <p>
                  {locale === 'en'
                    ? 'Read, predict, and try it in your own code.'
                    : 'Lee, predice y pruébalo con tu propio código.'}
                </p>
              </div>
              <a className="primary-link" href={lessonPath(locale, nextLesson.id)}>
                {locale === 'en' ? 'Open workspace' : 'Abrir espacio de trabajo'} →
              </a>
            </section>
          )}
          <div className="today-grid">
            <section className="clay-card">
              <h2>{text.preferences}</h2>
              <p>{data.preferences ? text[data.preferences.goal] : text.unknown}</p>
              <p>
                {text.rhythm}:{' '}
                {data.preferences?.weeklyMinutes
                  ? `${data.preferences.weeklyMinutes} ${text.minutes}`
                  : text.unset}
              </p>
              <a href={'/' + locale + '/start'}>{text.edit}</a>
            </section>
            <section>
              <h2>{text.choose}</h2>
              <ol className="lesson-cards">
                {data.lessons.map((lesson, index) => (
                  <li key={lesson.id}>
                    <a className="clay-card lesson-card" href={lessonPath(locale, lesson.id)}>
                      <span className="eyebrow">
                        {text.step} {index + 1}
                      </span>
                      <strong>{lesson.title}</strong>
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
          </div>
        </>
      )}
    </PageFrame>
  );
}
