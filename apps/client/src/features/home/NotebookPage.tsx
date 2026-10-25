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
    <PageFrame locale={locale} title={en ? 'Your learning notebook' : 'Tu cuaderno de aprendizaje'}>
      <p className="lede">
        {en
          ? 'Keep explanations in your own words. These are the same private notes you write inside each lesson.'
          : 'Guarda explicaciones con tus propias palabras. Son las mismas notas privadas que escribes en cada lección.'}
      </p>
      <AccountPanel locale={locale} onAccountChange={setAccount} unsavedNotes={dirty} />
      {account === undefined ? (
        <p role="status">{en ? 'Opening your notebook…' : 'Abriendo tu cuaderno…'}</p>
      ) : !account ? (
        <section className="clay-card empty-state">
          <h2>{en ? 'A place for your own words.' : 'Un lugar para tus propias palabras.'}</h2>
          <p>
            {en
              ? 'Sign in to keep private lesson notes and resume them on another device.'
              : 'Inicia sesión para guardar notas privadas y retomarlas en otro dispositivo.'}
          </p>
          <a href={lessonPath(locale)}>{en ? 'Explore a lesson' : 'Explorar una lección'} →</a>
        </section>
      ) : failed ? (
        <div role="alert">
          <p>{en ? 'Could not load your lessons.' : 'No se pudieron cargar tus lecciones.'}</p>
          <button onClick={() => setReload((n) => n + 1)}>
            {en ? 'Try again' : 'Intentar de nuevo'}
          </button>
        </div>
      ) : !lessons ? (
        <p role="status">{en ? 'Loading lessons…' : 'Cargando lecciones…'}</p>
      ) : (
        <div className="notebook-layout">
          <aside>
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
          <section className="clay-card notebook-paper">
            {lesson ? (
              <>
                <h2>{lesson.title}</h2>
                <a href={lessonPath(locale, lesson.id)}>{en ? 'Open lesson' : 'Abrir lección'} →</a>
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
