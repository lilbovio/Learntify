import type { Locale } from '@learntify/api-contracts';
import type { DraftState } from './sync';

export function CodeDraftStatus({
  state,
  locale,
  retry,
  resolve,
}: {
  state: DraftState | undefined;
  locale: Locale;
  retry: () => void;
  resolve: (choice: 'local' | 'remote') => void;
}) {
  const text =
    locale === 'en'
      ? {
          loading: 'Opening your saved code…',
          saved: 'Code saved to your account.',
          pending: 'Code changes waiting to save…',
          saving: 'Saving code…',
          error: 'Code could not sync. Keep this tab open and retry.',
          conflict: 'Your code changed on another device. Choose which version to keep.',
          retry: 'Retry code sync',
          keep: 'Keep my code',
          remote: 'Use saved code',
        }
      : {
          loading: 'Abriendo tu código guardado…',
          saved: 'Código guardado en tu cuenta.',
          pending: 'Cambios de código pendientes…',
          saving: 'Guardando código…',
          error: 'No se pudo sincronizar el código. Mantén la pestaña abierta y reintenta.',
          conflict: 'Tu código cambió en otro dispositivo. Elige qué versión conservar.',
          retry: 'Reintentar sincronización de código',
          keep: 'Conservar mi código',
          remote: 'Usar código guardado',
        };
  return (
    <div>
      <p role={state?.status === 'error' || state?.status === 'conflict' ? 'alert' : 'status'}>
        {text[state?.status ?? 'loading']}
      </p>
      {state?.status === 'error' && <button onClick={retry}>{text.retry}</button>}
      {state?.status === 'conflict' && state.remote && (
        <div>
          <pre>{state.remote.content}</pre>
          <button onClick={() => resolve('local')}>{text.keep}</button>{' '}
          <button onClick={() => resolve('remote')}>{text.remote}</button>
        </div>
      )}
    </div>
  );
}
