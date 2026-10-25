import { useEffect, useState } from 'react';
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
  const [accountId, setAccountId] = useState<string | null>(null);
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
        <AccountPanel locale={locale} onAccountChange={setAccountId} unsavedNotes={notesDirty} />
        <section className="intro" aria-labelledby="welcome">
          <div>
            <p className="eyebrow">{text.eyebrow}</p>
            <h1 id="welcome">{text.heading}</h1>
            <p className="lede">{text.intro}</p>
          </div>
          <div className="expression-object" aria-hidden="true">
            <span>3</span>
            <b>+</b>
            <span>2</span>
            <b>=</b>
            <span className="result">5</span>
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
                  onClick={() => {
                    if (!notesDirty || window.confirm(draftCopy[locale].leave))
                      setCurrentLessonId(item.id);
                  }}
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
          <article id="lesson" tabIndex={-1} className="lesson" aria-busy={loading}>
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
                  accountId={accountId}
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
              </div>
            )}
          </article>
        </div>
      </main>
      <footer>Learntify · MIT · Juan Pablo Bovio Vallejo</footer>
    </div>
  );
}
