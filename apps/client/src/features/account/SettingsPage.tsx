import { useEffect, useState } from 'react';
import { ApiError, createApiClient } from '@learntify/api-client';
import type { Locale } from '@learntify/api-contracts';
import { PageFrame } from '../../shared/PageFrame';
import { settingsCopy } from './settings-copy';
import { accountCopy } from './copy';
import { PasskeySettings } from './PasskeySettings';
import { SocialButtons } from './SocialButtons';
import { notifySessionChange } from '../../shared/session-events';

const api = createApiClient();
export function SettingsPage({ locale }: { locale: Locale }) {
  const text = settingsCopy[locale];
  const en = locale === 'en';
  const [state, setState] = useState<
    'loading' | 'guest' | 'member' | 'disabled' | 'failed' | 'deleted'
  >('loading');
  const [canDelete, setCanDelete] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<'request' | 'reauth' | null>(null);
  const [reload, setReload] = useState(0);
  const [sessionsRevoked, setSessionsRevoked] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setState('loading');
    void (async () => {
      try {
        const capabilities = await api.capabilities(controller.signal);
        const account = capabilities.accounts ? await api.currentAccount(controller.signal) : null;
        if (!controller.signal.aborted) {
          setCanDelete(capabilities.accountDeletion);
          setState(!capabilities.accounts ? 'disabled' : account ? 'member' : 'guest');
        }
      } catch {
        if (!controller.signal.aborted) setState('failed');
      }
    })();
    return () => controller.abort();
  }, [reload]);
  return (
    <PageFrame
      locale={locale}
      title={text.title}
      variant="account"
      eyebrow={en ? 'Account' : 'Cuenta'}
      lede={
        en
          ? 'Your preferences, sign-in methods and session, grouped by the task you want to do.'
          : 'Tus preferencias, métodos de acceso y sesión, agrupados por la tarea que quieres hacer.'
      }
    >
      {state === 'loading' ? (
        <div className="skeleton-panel" role="status">
          <p>{text.loading}</p>
        </div>
      ) : state === 'disabled' ? (
        <section className="clay-card empty-state">
          <h2>{en ? 'Accounts are taking a pause.' : 'Las cuentas están en pausa.'}</h2>
          <p>{text.unavailable}</p>
          <a className="primary-link" href={'/' + locale + '/learn'}>
            {en ? 'Continue learning' : 'Seguir aprendiendo'}
          </a>
        </section>
      ) : state === 'failed' ? (
        <div role="alert" className="callout callout-error">
          <p>{text.error}</p>
          <button onClick={() => setReload((n) => n + 1)}>{text.retry}</button>
        </div>
      ) : state === 'guest' ? (
        <section className="clay-card empty-state">
          <span className="stage-label">{en ? 'Your account' : 'Tu cuenta'}</span>
          <h2>{en ? 'Sign in to keep your work.' : 'Inicia sesión para guardar tu trabajo.'}</h2>
          <p>{text.guest}</p>
          <div className="page-actions">
            <a className="primary-link" href={'/' + locale + '/auth'}>
              {text.signIn}
            </a>
            <a className="text-link" href={'/' + locale + '/learn'}>
              {en ? 'Browse lessons' : 'Explorar lecciones'} →
            </a>
          </div>
        </section>
      ) : state === 'deleted' ? (
        <section className="clay-card empty-state">
          <span className="stage-label success-label">
            <span aria-hidden="true">✓</span> {en ? 'Done' : 'Listo'}
          </span>
          <h2 role="status">{text.done}</h2>
          <p>
            {en
              ? 'Your account and its private work have been removed.'
              : 'Tu cuenta y su trabajo privado se han eliminado.'}
          </p>
          <a className="primary-link" href={'/' + locale + '/learn'}>
            {text.back}
          </a>
        </section>
      ) : (
        <>
          {error && (
            <p role="alert" className="callout callout-error">
              {error === 'reauth' ? text.reauthenticate : text.error}
            </p>
          )}
          <div className="settings-grid">
            <section className="clay-card settings-card" aria-labelledby="settings-preferences">
              <p className="eyebrow">{en ? 'Learning' : 'Aprendizaje'}</p>
              <h2 id="settings-preferences">{en ? 'Preferences' : 'Preferencias'}</h2>
              <p>
                {en
                  ? 'Choose a direction and a weekly rhythm. These choices suggest a starting point; they never limit what you can learn.'
                  : 'Elige una dirección y un ritmo semanal. Estas opciones sugieren un punto de partida; nunca limitan lo que puedes aprender.'}
              </p>
              <a className="secondary-link" href={'/' + locale + '/start'}>
                {text.preferences} →
              </a>
            </section>
            <section className="clay-card settings-card" aria-labelledby="settings-session">
              <p className="eyebrow">{en ? 'This browser' : 'Este navegador'}</p>
              <h2 id="settings-session">{en ? 'Current session' : 'Sesión actual'}</h2>
              <p role="status">{accountCopy[locale].signedIn}</p>
              <p>{accountCopy[locale].sessionHelp}</p>
              <button
                className="secondary-button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError(null);
                  try {
                    await api.signOut();
                    notifySessionChange();
                    setState('guest');
                    setConfirmation('');
                  } catch {
                    setError('request');
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {text.signOut}
              </button>
            </section>
          </div>
          <div className="settings-methods">
            <PasskeySettings locale={locale} />
            <SocialButtons locale={locale} link />
          </div>
          {new URL(window.location.href).searchParams.has('socialError') && (
            <p role="alert" className="callout callout-error">
              {en
                ? 'Could not connect the provider. Use the same verified email and try again.'
                : 'No se pudo conectar el proveedor. Usa el mismo correo verificado e inténtalo de nuevo.'}
            </p>
          )}
          <section
            className="clay-card settings-card settings-wide"
            aria-labelledby="sessions-title"
          >
            <div>
              <p className="eyebrow">{en ? 'Security' : 'Seguridad'}</p>
              <h2 id="sessions-title">{text.otherSessions}</h2>
              <p>{text.otherSessionsHelp}</p>
            </div>
            <button
              className="secondary-button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError(null);
                setSessionsRevoked(false);
                try {
                  await api.revokeOtherSessions();
                  setSessionsRevoked(true);
                } catch (cause) {
                  if (cause instanceof ApiError && cause.status === 401) setState('guest');
                  else setError('request');
                } finally {
                  setBusy(false);
                }
              }}
            >
              {text.otherSessions}
            </button>
            {sessionsRevoked && <p role="status">{text.otherSessionsDone}</p>}
          </section>
          {canDelete ? (
            <section
              className="clay-card settings-card settings-wide account-deletion"
              aria-labelledby="deletion-title"
            >
              <div>
                <p className="eyebrow">{en ? 'Danger zone' : 'Zona sensible'}</p>
                <h2 id="deletion-title">{text.deletion}</h2>
                <p>{text.explanation}</p>
                <p>{text.recent}</p>
              </div>
              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  setBusy(true);
                  setError(null);
                  try {
                    await api.deleteAccount(confirmation);
                    setConfirmation('');
                    setState('deleted');
                  } catch (cause) {
                    if (cause instanceof ApiError && cause.status === 401) {
                      setState('guest');
                      setConfirmation('');
                    } else
                      setError(
                        cause instanceof ApiError && cause.code === 'REAUTHENTICATION_REQUIRED'
                          ? 'reauth'
                          : 'request',
                      );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <label htmlFor="delete-confirmation">{text.confirm}</label>
                <input
                  id="delete-confirmation"
                  value={confirmation}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={busy}
                  onChange={(event) => setConfirmation(event.target.value)}
                />
                <button
                  className="danger-button"
                  disabled={busy || confirmation !== 'DELETE'}
                  type="submit"
                >
                  {busy ? text.deleting : text.remove}
                </button>
              </form>
            </section>
          ) : (
            <p>{text.deletionUnavailable}</p>
          )}
        </>
      )}
    </PageFrame>
  );
}
