import { useEffect, useState } from 'react';
import { createApiClient } from '@learntify/api-client';
import type { LessonListItem, Locale } from '@learntify/api-contracts';
import { PageFrame } from '../../shared/PageFrame';
import { lessonPath } from '../../shared/routes';
import { AccountPanel } from '../account/AccountPanel';
import { LessonNotes } from '../draft/LessonNotes';
import { draftCopy } from '../draft/copy';

const api = createApiClient();
export function NotebookPage({ locale }: { locale: Locale }) {
  const en = locale === 'en';
  const [account, setAccount] = useState<string | null>();
  const [lessons, setLessons] = useState<LessonListItem[]>();
  const [selected, setSelected] = useState('');
  const [dirty, setDirty] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reload, setReload] = useState(0);
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
  const lesson = lessons?.find((item) => item.id === selected);
  return (
    <PageFrame
      locale={locale}
      eyebrow={en ? 'Notebook' : 'Cuaderno'}
      title={en ? 'Your learning notebook' : 'Tu cuaderno de aprendizaje'}
      lede={
        en
          ? 'Keep explanations in your own words. These are the same private notes you write inside each lesson.'
          : 'Guarda explicaciones con tus propias palabras. Son las mismas notas privadas que escribes en cada lección.'
      }
    >
      <AccountPanel locale={locale} onAccountChange={setAccount} unsavedNotes={dirty} />
      {account === undefined ? (
        <p role="status">{en ? 'Opening your notebook…' : 'Abriendo tu cuaderno…'}</p>
      ) : !account ? (
        <section className="clay-card empty-state">
          <span className="stage-label">{en ? 'Private notes' : 'Notas privadas'}</span>
          <h2>{en ? 'A place for your own words.' : 'Un lugar para tus propias palabras.'}</h2>
          <p>
            {en
              ? 'Sign in to keep private lesson notes and resume them on another device.'
              : 'Inicia sesión para guardar notas privadas y retomarlas en otro dispositivo.'}
          </p>
          <div className="page-actions">
            <a className="primary-link" href={'/' + locale + '/auth'}>
              {en ? 'Sign in to write notes' : 'Iniciar sesión para escribir notas'}
            </a>
            <a className="text-link" href={lessonPath(locale)}>
              {en ? 'Explore a lesson' : 'Explorar una lección'} →
            </a>
          </div>
        </section>
      ) : failed ? (
        <div role="alert" className="callout callout-error">
          <p>{en ? 'Could not load your lessons.' : 'No se pudieron cargar tus lecciones.'}</p>
          <button onClick={() => setReload((n) => n + 1)}>
            {en ? 'Try again' : 'Intentar de nuevo'}
          </button>
        </div>
      ) : !lessons ? (
        <div className="skeleton-panel" role="status">
          <p>{en ? 'Loading lessons…' : 'Cargando lecciones…'}</p>
        </div>
      ) : (
        <div className="notebook-layout">
          <aside className="notebook-index">
            <p className="eyebrow">{en ? 'Open notes' : 'Abrir notas'}</p>
            <label className="lesson-search">
              {en ? 'Choose a lesson' : 'Elige una lección'}
              <select
                value={selected}
                onChange={(event) => {
                  if (!dirty || window.confirm(draftCopy[locale].leave))
                    setSelected(event.target.value);
                }}
              >
                <option value="">{en ? 'Select a lesson' : 'Selecciona una lección'}</option>
                {lessons.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
            <p className="practice-note">
              {en
                ? 'Notes sync automatically. If another device changes a note, you choose which version to keep.'
                : 'Las notas se sincronizan automáticamente. Si otro dispositivo cambia una nota, tú eliges qué versión conservar.'}
            </p>
          </aside>
          <section className="notebook-paper" aria-live="polite">
            {lesson ? (
              <>
                <header className="notebook-paper-head">
                  <div>
                    <p className="eyebrow">{en ? 'Lesson notes' : 'Notas de la lección'}</p>
                    <h2>{lesson.title}</h2>
                  </div>
                  <a className="text-link" href={lessonPath(locale, lesson.id)}>
                    {en ? 'Open lesson' : 'Abrir lección'} →
                  </a>
                </header>
                <LessonNotes
                  key={`${account}:${lesson.id}:${lesson.version}`}
                  lessonId={lesson.id}
                  version={lesson.version}
                  locale={locale}
                  onDirty={setDirty}
                />
              </>
            ) : (
              <>
                <span className="stage-label">{en ? 'Make it yours' : 'Hazlo tuyo'}</span>
                <h2>{en ? 'What made the idea click?' : '¿Qué te ayudó a entender la idea?'}</h2>
                <p>
                  {en
                    ? 'Choose a lesson to open its notes. Explain the idea, save a useful example, or write a question to revisit.'
                    : 'Elige una lección para abrir sus notas. Explica la idea, guarda un ejemplo útil o escribe una pregunta para después.'}
                </p>
              </>
            )}
          </section>
        </div>
      )}
    </PageFrame>
  );
}
