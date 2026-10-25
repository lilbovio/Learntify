import { useEffect, useRef, useState } from 'react';
import type { Lesson, Locale } from '@learntify/api-contracts';
import { SaveAttempt } from './SaveAttempt';
import { useCodeDraft } from '../draft/useCodeDraft';
import { CodeDraftStatus } from '../draft/CodeDraftStatus';
import { AttemptHistory } from './AttemptHistory';

const copy = {
  en: {
    title: 'Make it work',
    editor: 'Your JavaScript',
    run: 'Run code',
    stop: 'Stop',
    reset: 'Reset code',
    output: 'Your output',
    expected: 'Expected output',
    pass: 'Output matches. Explain why your code produces this result.',
    retry: 'Compare the outputs, change your code, and try again.',
    timeout: 'Execution stopped. Check for a loop that never ends.',
    stopped: 'Execution stopped.',
    unavailable: 'The runner could not start. Reload the page and try again.',
    saved: 'Code saved in this browser only.',
    unsaved: 'Browser storage is unavailable. Copy your code before leaving.',
    note: 'This checks output, not mastery. This exercise supports synchronous JavaScript and console.log; browser APIs are unavailable.',
  },
  es: {
    title: 'Haz que funcione',
    editor: 'Tu JavaScript',
    run: 'Ejecutar código',
    stop: 'Detener',
    reset: 'Restablecer código',
    output: 'Tu resultado',
    expected: 'Resultado esperado',
    pass: 'El resultado coincide. Explica por qué tu código produce este resultado.',
    retry: 'Compara los resultados, cambia tu código e inténtalo de nuevo.',
    timeout: 'Ejecución detenida. Busca un bucle que nunca termina.',
    stopped: 'Ejecución detenida.',
    unavailable: 'No se pudo iniciar el ejecutor. Recarga la página e inténtalo de nuevo.',
    saved: 'Código guardado solo en este navegador.',
    unsaved: 'El almacenamiento no está disponible. Copia tu código antes de salir.',
    note: 'Esto comprueba el resultado, no el dominio del tema. Este ejercicio admite JavaScript síncrono y console.log; las API del navegador no están disponibles.',
  },
};

export function CodeExercise({
  lesson,
  locale,
  accountId,
  accountReady,
  onCodeDirty,
}: {
  lesson: Lesson;
  locale: Locale;
  accountId: string | null;
  accountReady: boolean;
  onCodeDirty: (value: boolean) => void;
}) {
  const text = copy[locale];
  const draft = useCodeDraft(lesson, accountId, onCodeDirty);
  const code = draft.code;
  const editable = accountReady && draft.ready;
  const [running, setRunning] = useState(false);
  const [attemptId, setAttemptId] = useState('');
  const [result, setResult] = useState<{ output: string[]; error?: string }>();
  const active = useRef<{ worker: Worker; timer: ReturnType<typeof setTimeout> } | null>(null);
  function dispose() {
    if (active.current) {
      active.current.worker.terminate();
      clearTimeout(active.current.timer);
      active.current = null;
    }
  }
  useEffect(() => () => dispose(), []);
  useEffect(() => {
    dispose();
    setRunning(false);
    setResult(undefined);
  }, [code, accountId]);
  function change(value: string) {
    draft.edit(value);
    setResult(undefined);
  }
  function run() {
    dispose();
    setAttemptId(crypto.randomUUID());
    setRunning(true);
    setResult(undefined);
    try {
      const worker = new Worker(new URL('./runner.worker.ts', import.meta.url), { type: 'module' });
      const finish = (value: { output: string[]; error?: string }) => {
        if (active.current?.worker !== worker) return;
        dispose();
        setRunning(false);
        setResult(value);
      };
      active.current = {
        worker,
        timer: setTimeout(() => finish({ output: [], error: text.timeout }), 5000),
      };
      worker.onmessage = (event: MessageEvent<{ output: string[]; error?: string }>) =>
        finish(event.data);
      worker.onerror = () => finish({ output: [], error: text.unavailable });
      worker.postMessage(code);
    } catch {
      dispose();
      setRunning(false);
      setResult({ output: [], error: text.unavailable });
    }
  }
  const passed =
    result &&
    !result.error &&
    JSON.stringify(result.output) === JSON.stringify(lesson.coding.expectedOutput);
  return (
    <section className="code-exercise" aria-labelledby="code-title">
      <h3 id="code-title">{text.title}</h3>
      <p>{lesson.coding.prompt}</p>
      <label htmlFor="code-editor">{text.editor}</label>
      <textarea
        id="code-editor"
        className="code-editor"
        value={code}
        maxLength={16000}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        disabled={running || !editable}
        onChange={(event) => change(event.target.value)}
      />
      <div className="practice-actions">
        <button type="button" disabled={running || !editable} onClick={run}>
          {text.run}
        </button>
        {running && (
          <button
            type="button"
            onClick={() => {
              dispose();
              setRunning(false);
              setResult({ output: [], error: text.stopped });
            }}
          >
            {text.stop}
          </button>
        )}
        <button
          type="button"
          disabled={running || !editable}
          onClick={() => change(lesson.example)}
        >
          {text.reset}
        </button>
      </div>
      {accountId ? (
        <CodeDraftStatus
          state={draft.state}
          locale={locale}
          retry={draft.retry}
          resolve={draft.resolve}
        />
      ) : (
        draft.localSaved !== undefined && (
          <small>{draft.localSaved ? text.saved : text.unsaved}</small>
        )
      )}
      <h4>{text.expected}</h4>
      <pre>{lesson.coding.expectedOutput.join('\n')}</pre>
      {result && (
        <div role="status">
          <h4>{text.output}</h4>
          <pre>{result.output.join('\n') || '—'}</pre>
          <p>{result.error || (passed ? text.pass : text.retry)}</p>
        </div>
      )}
      <p className="practice-note">{text.note}</p>
      {result && accountId && (
        <SaveAttempt
          key={accountId + ':' + attemptId}
          locale={locale}
          input={{
            id: attemptId,
            lessonId: lesson.id,
            lessonVersion: lesson.version,
            code,
            matched: Boolean(passed),
            expectedAccountId: accountId,
          }}
        />
      )}
      {result && !accountId && (
        <p>
          {locale === 'en'
            ? 'Sign in to save attempts and see your review queue.'
            : 'Inicia sesión para guardar intentos y ver tus repasos.'}
        </p>
      )}
      {accountId && (
        <AttemptHistory
          key={accountId}
          lessonId={lesson.id}
          locale={locale}
          restore={change}
          disabled={running || !editable || draft.state?.status === 'conflict'}
        />
      )}
    </section>
  );
}
