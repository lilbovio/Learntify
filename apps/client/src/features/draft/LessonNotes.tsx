import { SessionRecovery } from '../../shared/SessionRecovery';
import { useEffect, useRef, useState } from 'react';
import { createApiClient } from '@learntify/api-client';
import type { Locale } from '@learntify/api-contracts';
import { DraftSync, type DraftState } from './sync';
import { draftCopy } from './copy';

const api = createApiClient();
export function LessonNotes({
  lessonId,
  version,
  locale,
  onDirty,
}: {
  lessonId: string;
  version: number;
  locale: Locale;
  onDirty: (value: boolean) => void;
}) {
  const controller = useRef<DraftSync | undefined>(undefined);
  const [state, setState] = useState<DraftState>({ content: '', status: 'loading', dirty: false });
  const text = draftCopy[locale];
  useEffect(() => {
    const sync = new DraftSync(api, lessonId, version, (value) => {
      setState(value);
      onDirty(value.dirty);
    });
    controller.current = sync;
    void sync.start();
    const onFocus = () => {
      void sync.refresh();
    };
    const onLeave = (event: BeforeUnloadEvent) => {
      if (sync.state.dirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('beforeunload', onLeave);
    return () => {
      sync.dispose();
      onDirty(false);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('beforeunload', onLeave);
    };
  }, [lessonId, version, onDirty]);
  return (
    <section className="lesson-notes" aria-labelledby="notes-title">
      <h3 id="notes-title">{text.title}</h3>
      <p id="notes-hint">{text.hint}</p>
      <textarea
        aria-label={text.title}
        aria-describedby="notes-hint"
        rows={6}
        maxLength={16000}
        value={state.content}
        disabled={state.status === 'loading' || !state.opened}
        onChange={(event) => controller.current?.edit(event.target.value)}
      />
      <p role={state.status === 'error' || state.status === 'conflict' ? 'alert' : 'status'}>
        {text[state.status]}
      </p>
      {state.sessionExpired && <SessionRecovery locale={locale} />}
      {state.status === 'error' && (
        <button
          onClick={() => {
            void controller.current?.retry();
          }}
        >
          {text.retry}
        </button>
      )}
      {state.status === 'conflict' && state.remote && (
        <div>
          <h4>{text.remote}</h4>
          <pre className="notes-comparison">{state.remote.content}</pre>
          <button onClick={() => controller.current?.resolve('local')}>{text.keep}</button>{' '}
          <button onClick={() => controller.current?.resolve('remote')}>{text.useRemote}</button>
        </div>
      )}
    </section>
  );
}
