import { useState } from 'react';
import { ApiError, createApiClient } from '@learntify/api-client';
import type { Locale, PracticeAttemptInput } from '@learntify/api-contracts';

const api = createApiClient();
export function SaveAttempt({ input, locale }: { input: PracticeAttemptInput; locale: Locale }) {
  const [state, setState] = useState<'ready' | 'saving' | 'saved' | 'error' | 'limit' | 'changed'>(
    'ready',
  );
  const text =
    locale === 'en'
      ? {
          save: 'Save practice attempt',
          saving: 'Saving attempt…',
          saved: 'Attempt saved to your account.',
          error: 'Could not save. Your result is still here; try again.',
          limit: 'Daily save limit reached. You can keep practicing and save again later.',
          changed: 'Your account or lesson changed. Reload before saving.',
          progress: 'View progress and review',
        }
      : {
          save: 'Guardar intento de práctica',
          saving: 'Guardando intento…',
          saved: 'Intento guardado en tu cuenta.',
          error: 'No se pudo guardar. Tu resultado sigue aquí; inténtalo de nuevo.',
          limit: 'Alcanzaste el límite diario. Puedes seguir practicando y guardar más tarde.',
          changed: 'Tu cuenta o lección cambió. Recarga antes de guardar.',
          progress: 'Ver progreso y repaso',
        };
  async function save() {
    setState('saving');
    try {
      await api.saveAttempt(input);
      setState('saved');
    } catch (error) {
      setState(
        error instanceof ApiError && error.code === 'PRACTICE_LIMIT'
          ? 'limit'
          : error instanceof ApiError &&
              ['ACCOUNT_CHANGED', 'STALE_LESSON', 'UNAUTHENTICATED'].includes(error.code)
            ? 'changed'
            : 'error',
      );
    }
  }
  return (
    <div className="attempt-save">
      <button
        type="button"
        disabled={['saving', 'saved', 'changed'].includes(state)}
        onClick={() => void save()}
      >
        {state === 'saving' ? text.saving : text.save}
      </button>
      {state !== 'ready' && state !== 'saving' && (
        <p role={state === 'saved' ? 'status' : 'alert'}>{text[state]}</p>
      )}
      {state === 'saved' && <a href={'/' + locale + '/today'}>{text.progress}</a>}
    </div>
  );
}
