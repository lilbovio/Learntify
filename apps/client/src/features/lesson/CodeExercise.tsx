import { useEffect, useRef, useState } from 'react';
import type { Lesson, Locale } from '@learntify/api-contracts';
import { SaveAttempt } from './SaveAttempt';
import { useCodeDraft } from '../draft/useCodeDraft';
import { CodeDraftStatus } from '../draft/CodeDraftStatus';
import { DownloadWork } from '../../shared/DownloadWork';
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
  type RunResult = {
    output: string[];
    error?: string;
    checks?: Array<{ passed: boolean; actual: string }>;
  };
  const [result, setResult] = useState<RunResult>();
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
      const finish = (value: RunResult) => {
        if (active.current?.worker !== worker) return;
        dispose();
        setRunning(false);
        setResult(value);
      };
      active.current = {
        worker,
        timer: setTimeout(() => finish({ output: [], error: text.timeout }), 5000),
      };
      worker.onmessage = (event: MessageEvent<RunResult>) => finish(event.data);
      worker.onerror = () => finish({ output: [], error: text.unavailable });
      worker.postMessage(lesson.coding.checks ? { code, checks: lesson.coding.checks } : code);
    } catch {
      dispose();
      setRunning(false);
      setResult({ output: [], error: text.unavailable });
    }
  }
  const passed =
    result &&
    !result.error &&
    (lesson.coding.checks
      ? result.checks?.length === lesson.coding.checks.length &&
        result.checks.every((check) => check.passed)
      : JSON.stringify(result.output) === JSON.stringify(lesson.coding.expectedOutput));
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
      <DownloadWork
        content={code}
        filename={`${lesson.id}.js`}
        locale={locale}
        disabled={!draft.ready}
      />
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
      {lesson.coding.checks ? (
        <section
          className="project-checks"
          aria-label={locale === 'en' ? 'Project checks' : 'Pruebas del proyecto'}
        >
          <h4>{locale === 'en' ? 'Function checks' : 'Pruebas de la función'}</h4>
          <p>
            {locale === 'en'
              ? 'These visible examples check returned values. They are not exhaustive or tamper-proof, and do not certify mastery.'
              : 'Estos ejemplos visibles comprueban valores devueltos. No son exhaustivos ni a prueba de manipulación y no certifican dominio.'}
          </p>
          <ul>
            {lesson.coding.checks.map((check, index) => (
              <li key={check.label}>
                <strong>{check.label}</strong> —{' '}
                {result?.checks?.[index]
                  ? result.checks[index].passed
                    ? locale === 'en'
                      ? 'Passed'
                      : 'Correcto'
                    : `${locale === 'en' ? 'Needs work' : 'Revisar'}: ${result.checks[index].actual}`
                  : locale === 'en'
                    ? 'Not checked'
                    : 'Sin comprobar'}
                <details>
                  <summary>{locale === 'en' ? 'View case' : 'Ver caso'}</summary>
                  <pre>{check.expression}</pre>
                  <p>
                    {text.expected}: {check.expected}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <>
          <h4>{text.expected}</h4>
          <pre>{lesson.coding.expectedOutput.join('\n')}</pre>
        </>
      )}
      {result && (
        <div role="status">
          <h4>{text.output}</h4>
          <pre>{result.output.join('\n') || '—'}</pre>
          <p>
            {result.error ||
              (lesson.coding.checks
                ? passed
                  ? locale === 'en'
                    ? 'All project checks passed. Review and explain your solution.'
                    : 'Todas las pruebas pasaron. Revisa y explica tu solución.'
                  : locale === 'en'
                    ? 'Review the failing checks and try again.'
                    : 'Revisa las pruebas que fallan e inténtalo de nuevo.'
                : passed
                  ? text.pass
                  : text.retry)}
          </p>
        </div>
      )}
      <p className="practice-note">
        {lesson.coding.checks
          ? locale === 'en'
            ? 'Checks run in your browser and saved attempts are self-reported practice. Synchronous JavaScript only; browser APIs are unavailable.'
            : 'Las pruebas se ejecutan en tu navegador y los intentos guardados son práctica informada por el cliente. Solo JavaScript síncrono; las API del navegador no están disponibles.'
          : text.note}
      </p>
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
