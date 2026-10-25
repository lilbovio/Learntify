import { useEffect, useRef, useState } from 'react';
import { createApiClient } from '@learntify/api-client';
import type { Lesson, LessonListItem, Locale } from '@learntify/api-contracts';
import { readRoute, lessonPath } from '../shared/routes';
import { LessonWorkspace } from '../features/lesson/LessonWorkspace';
import { copy } from '../shared/copy';
import { AccountPanel } from '../features/account/AccountPanel';
import { LessonNotes } from '../features/draft/LessonNotes';
import { draftCopy } from '../features/draft/copy';

const api = createApiClient();
export function LessonPage() {
  const [locale, setLocale] = useState<Locale>(() => readRoute(window.location.pathname).locale);
  const [accountId, setAccountId] = useState<string | null>();
  const [codeDirty, setCodeDirty] = useState(false);
  const [notesDirty, setNotesDirty] = useState(false);
  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState(
    () => readRoute(window.location.pathname).lessonId ?? 'values-and-expressions',
  );
  const [lesson, setLesson] = useState<Lesson>();
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [catalogFailed, setCatalogFailed] = useState(false);
  const [reload, setReload] = useState(0);
  const text = copy[locale];
  const lessonRegion = useRef<HTMLElement>(null);
  const navigating = useRef(false);
  const currentIndex = lessons.findIndex((item) => item.id === currentLessonId);
  function selectLesson(id: string) {
    if (
      id !== currentLessonId &&
      (!(notesDirty || codeDirty) || window.confirm(draftCopy[locale].leave))
    ) {
      navigating.current = true;
      setCurrentLessonId(id);
    }
  }
  useEffect(() => {
    if (!loading && navigating.current) {
      navigating.current = false;
      lessonRegion.current?.focus({ preventScroll: true });
      lessonRegion.current?.scrollIntoView({ block: 'start' });
    }
  }, [loading]);

  useEffect(() => {
    const controller = new AbortController();
    setCatalogFailed(false);
    api
      .listLessons(locale, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setLessons(value);
      })
      .catch(() => {
        if (!controller.signal.aborted) setCatalogFailed(true);
      });
    return () => controller.abort();
  }, [locale, reload]);

  useEffect(() => {
    document.documentElement.lang = locale;
    const url = new URL(window.location.href);
    url.pathname = lessonPath(locale, currentLessonId);
    url.searchParams.set('lang', locale);
    url.searchParams.set('lesson', currentLessonId);
    window.history.replaceState(null, '', url);
    const controller = new AbortController();
    setLoading(true);
    setLoadFailed(false);
    api
      .getLesson(currentLessonId, locale, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) {
          setLesson(value);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setLoadFailed(true);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [locale, reload, currentLessonId]);

  return (
    <div className="shell">
      <a className="skip-link" href="#lesson">
        Skip to lesson / Ir a la lección
      </a>
      <header className="topbar">
        <a className="brand" href={'/' + locale}>
          learntify<span aria-hidden="true">.</span>
        </a>
        <a href={'/' + locale + '/today'}>{locale === 'en' ? 'Today' : 'Hoy'}</a>
        <label className="language">
          {text.language}
          <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </label>
      </header>
      <main>
        <AccountPanel
          locale={locale}
          onAccountChange={setAccountId}
          unsavedNotes={notesDirty || codeDirty}
        />
        <section className="lesson-intro" aria-labelledby="welcome">
          <div>
            <p className="eyebrow">
              {locale === 'en' ? 'JavaScript / Foundations' : 'JavaScript / Fundamentos'}
            </p>
            <h1 id="welcome">
              {locale === 'en'
                ? 'One idea. Put into practice.'
                : 'Una idea. Llévala a la práctica.'}
            </h1>
            <p className="lede">
              {locale === 'en'
                ? 'Read, predict, experiment. Take the time you need.'
                : 'Lee, predice, experimenta. Tómate el tiempo que necesites.'}
            </p>
          </div>
        </section>
        <div className="workspace">
          <aside className="path">
            <p className="eyebrow">{text.path}</p>
            <nav aria-label={text.lessons}>
              {lessons.map((item, index) => (
                <button
                  className="lesson-link"
                  key={item.id}
                  aria-current={currentLessonId === item.id ? 'step' : undefined}
                  onClick={() => selectLesson(item.id)}
                >
                  <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
                  <span>{item.title}</span>
                </button>
              ))}
            </nav>
            {catalogFailed && (
              <div role="alert">
                <p>{text.error}</p>
                <button onClick={() => setReload((value) => value + 1)}>{text.retry}</button>
              </div>
            )}
            <p>{text.about}</p>
            <span className="free-label">{text.availability}</span>
          </aside>
          <article
            ref={lessonRegion}
            id="lesson"
            tabIndex={-1}
            className="lesson"
            aria-busy={loading}
          >
            {loading && <p role="status">{text.loading}</p>}
            {loadFailed && (
              <div role="alert">
                <p>{text.error}</p>
                <button onClick={() => setReload((value) => value + 1)}>{text.retry}</button>
              </div>
            )}
            {/* Keep a locale refresh mounted so temporary answers survive unavailable browser storage. */}
            {lesson && lesson.id === currentLessonId && (
              <div hidden={loading || loadFailed}>
                <LessonWorkspace
                  accountId={accountId ?? null}
                  accountReady={accountId !== undefined}
                  onCodeDirty={setCodeDirty}
                  key={lesson.id + ':' + lesson.version}
                  lesson={lesson}
                  locale={locale}
                />
                {accountId && (
                  <LessonNotes
                    key={accountId + ':' + lesson.id + ':' + lesson.version}
                    lessonId={lesson.id}
                    version={lesson.version}
                    locale={locale}
                    onDirty={setNotesDirty}
                  />
                )}
                <nav
                  className="lesson-pagination"
                  aria-label={locale === 'en' ? 'Continue learning' : 'Continuar aprendiendo'}
                >
                  {currentIndex > 0 && (
                    <button
                      className="secondary-button"
                      onClick={() => selectLesson(lessons[currentIndex - 1]!.id)}
                    >
                      {locale === 'en' ? 'Previous lesson' : 'Lección anterior'}
                    </button>
                  )}
                  {currentIndex >= 0 && currentIndex < lessons.length - 1 ? (
                    <button onClick={() => selectLesson(lessons[currentIndex + 1]!.id)}>
                      {locale === 'en' ? 'Next lesson' : 'Siguiente lección'}
                    </button>
                  ) : (
                    <a href={'/' + locale + '/today'}>
                      {locale === 'en' ? 'Return to your practice' : 'Volver a tu práctica'}
                    </a>
                  )}
                </nav>
              </div>
            )}
          </article>
        </div>
      </main>
      <footer>Learntify · MIT · Juan Pablo Bovio Vallejo</footer>
    </div>
  );
}
