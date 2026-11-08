import { useEffect, useState } from 'react';
import { ApiError, createApiClient } from '@learntify/api-client';
import { SessionRecovery } from '../../shared/SessionRecovery';
import type { Locale, SavedAttempt } from '@learntify/api-contracts';
const api = createApiClient();

export function AttemptHistory({
  lessonId,
  locale,
  restore,
  disabled,
}: {
  lessonId: string;
  locale: Locale;
  restore: (code: string) => void;
  disabled: boolean;
}) {
  const [opened, setOpened] = useState(false);
  const [rows, setRows] = useState<SavedAttempt[]>();
  const [failed, setFailed] = useState(false);
  const [expired, setExpired] = useState(false);
  const [reload, setReload] = useState(0);
  const text =
    locale === 'en'
      ? {
          title: 'Recent attempts',
          hint: 'Your latest 20 saved attempts for this lesson version. Loading one replaces the editor and saves it as your current draft.',
          load: 'Load into editor',
          confirm: 'Replace the code in your editor with this saved attempt?',
          empty: 'No saved attempts yet.',
          error: 'Could not load attempts.',
          refresh: 'Refresh attempts',
          loading: 'Loading attempts…',
          match: 'Output matched',
          mismatch: 'Output did not match',
        }
      : {
          title: 'Intentos recientes',
          hint: 'Tus últimos 20 intentos guardados para esta versión. Cargar uno reemplaza el editor y lo guarda como borrador actual.',
          load: 'Cargar en el editor',
          confirm: '¿Reemplazar el código del editor con este intento guardado?',
          empty: 'Todavía no hay intentos guardados.',
          error: 'No se pudieron cargar los intentos.',
          refresh: 'Actualizar intentos',
          loading: 'Cargando intentos…',
          match: 'El resultado coincidió',
          mismatch: 'El resultado no coincidió',
        };
  useEffect(() => {
    if (!opened) return;
    const controller = new AbortController();
    setFailed(false);
    setExpired(false);
    setRows(undefined);
    void api
      .attemptHistory(lessonId, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setRows(value);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          setFailed(true);
          setExpired(cause instanceof ApiError && cause.status === 401);
        }
      });
    return () => controller.abort();
  }, [lessonId, opened, reload]);
  return (
    <details className="attempt-history" onToggle={(event) => setOpened(event.currentTarget.open)}>
      <summary>{text.title}</summary>
      <p>{text.hint}</p>
      {expired && <SessionRecovery locale={locale} />}
      <button onClick={() => setReload((n) => n + 1)}>{text.refresh}</button>
      {failed ? (
        <p role="alert">{text.error}</p>
      ) : !rows ? (
        <p role="status">{text.loading}</p>
      ) : !rows.length ? (
        <p>{text.empty}</p>
      ) : (
        <ol>
          {rows.map((row) => (
            <li key={row.id}>
              <p>
                {new Date(row.createdAt).toLocaleString(locale)} ·{' '}
                {row.matched ? text.match : text.mismatch}
              </p>
              <pre>{row.code}</pre>
              <button
                disabled={disabled}
                onClick={() => {
                  if (window.confirm(text.confirm)) restore(row.code);
                }}
              >
                {text.load}
              </button>
            </li>
          ))}
        </ol>
      )}
    </details>
  );
}
