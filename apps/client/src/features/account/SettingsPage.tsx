import { useEffect, useState } from 'react';
import { ApiError, createApiClient } from '@learntify/api-client';
import type { Locale } from '@learntify/api-contracts';
import { PageFrame } from '../../shared/PageFrame';
import { settingsCopy } from './settings-copy';
import { accountCopy } from './copy';
import { PasskeySettings } from './PasskeySettings';
import { SocialButtons } from './SocialButtons';

const api = createApiClient();
export function SettingsPage({ locale }: { locale: Locale }) {
  const text = settingsCopy[locale];
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
    <PageFrame locale={locale} title={text.title} variant="account">
      {state === 'loading' ? (
        <p role="status">{text.loading}</p>
      ) : state === 'disabled' ? (
        <p>{text.unavailable}</p>
      ) : state === 'failed' ? (
        <div role="alert">
          <p>{text.error}</p>
          <button onClick={() => setReload((n) => n + 1)}>{text.retry}</button>
        </div>
      ) : state === 'guest' ? (
        <>
          <p>{text.guest}</p>
          <a href={'/' + locale + '/auth'}>{text.signIn}</a>
        </>
      ) : state === 'deleted' ? (
        <>
          <p role="status">{text.done}</p>
          <a href={'/' + locale + '/today'}>{text.back}</a>
        </>
      ) : (
        <>
          <p>
            <a href={'/' + locale + '/start'}>{text.preferences}</a>
          </p>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                await api.signOut();
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
          <p>{accountCopy[locale].sessionHelp}</p>
          <PasskeySettings locale={locale} />
          <SocialButtons locale={locale} link />
          {new URL(window.location.href).searchParams.has('socialError') && (
            <p role="alert">
              {locale === 'en'
                ? 'Could not connect the provider. Use the same verified email and try again.'
                : 'No se pudo conectar el proveedor. Usa el mismo correo verificado e inténtalo de nuevo.'}
            </p>
          )}
          <section className="clay-card" aria-labelledby="sessions-title">
            <h2 id="sessions-title">{text.otherSessions}</h2>
            <p>{text.otherSessionsHelp}</p>
            <button
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
            <section className="clay-card account-deletion" aria-labelledby="deletion-title">
              <h2 id="deletion-title">{text.deletion}</h2>
              <p>{text.explanation}</p>
              <p>{text.recent}</p>
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
                <button disabled={busy || confirmation !== 'DELETE'} type="submit">
                  {busy ? text.deleting : text.remove}
                </button>
              </form>
            </section>
          ) : (
            <p>{text.deletionUnavailable}</p>
          )}
          {error && <p role="alert">{error === 'reauth' ? text.reauthenticate : text.error}</p>}
        </>
      )}
    </PageFrame>
  );
}
