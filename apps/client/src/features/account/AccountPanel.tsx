import { useEffect, useState } from 'react';
import { createApiClient } from '@learntify/api-client';
import type { Locale } from '@learntify/api-contracts';
import { accountCopy } from './copy';
import { SocialButtons } from './SocialButtons';
import { passkeyAuth, supportsPasskeys } from './passkeys';

const api = createApiClient();
export function AccountPanel({
  locale,
  onAccountChange,
  unsavedNotes,
  standalone = false,
}: {
  locale: Locale;
  onAccountChange: (id: string | null) => void;
  unsavedNotes: boolean;
  standalone?: boolean;
}) {
  const text = accountCopy[locale];
  const reauthenticate =
    standalone && new URL(window.location.href).searchParams.get('reauth') === '1';
  const [state, setState] = useState<'loading' | 'disabled' | 'guest' | 'member' | 'failed'>(
    'loading',
  );
  const [refresh, setRefresh] = useState(0);
  const [email, setEmail] = useState('');
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);
  const [invalidLink, setInvalidLink] = useState(() => {
    const url = new URL(window.location.href);
    return url.searchParams.has('error');
  });
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('error');
    url.searchParams.delete('error_description');
    window.history.replaceState(null, '', url);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setState('loading');
    void (async () => {
      try {
        const capabilities = await api.capabilities(controller.signal);
        const enabled = capabilities.accounts;
        if (!enabled) {
          if (!controller.signal.aborted) {
            setState('disabled');
            onAccountChange(null);
          }
          return;
        }
        const account = await api.currentAccount(controller.signal);
        if (!controller.signal.aborted) {
          setState(account && !reauthenticate ? 'member' : 'guest');
          onAccountChange(capabilities.cloudDrafts ? (account?.id ?? null) : null);
        }
      } catch {
        if (!controller.signal.aborted) setState('failed');
      }
    })();
    return () => controller.abort();
  }, [refresh, onAccountChange, reauthenticate]);
  if (state === 'loading') return standalone ? <p role="status">{text.loading}</p> : null;
  if (state === 'disabled') return standalone ? <p role="status">{text.unavailable}</p> : null;
  if (state === 'guest' && !standalone)
    return (
      <p className="account-entry">
        <a href={'/' + locale + '/auth'}>{text.signIn}</a>
      </p>
    );
  return (
    <section
      className={
        !standalone && state === 'member' ? 'account-panel account-compact' : 'account-panel'
      }
      aria-labelledby="account-title"
    >
      <h2 id="account-title">{text.title}</h2>
      {state === 'failed' ? (
        <div role="alert">
          <p>{text.error}</p>
          <button onClick={() => setRefresh((value) => value + 1)}>{text.retry}</button>
        </div>
      ) : state === 'member' ? (
        <div>
          <p role="status">{text.signedIn}</p>
          {standalone && <p>{text.sessionHelp}</p>}
          <p>
            <a href={'/' + locale + '/settings'}>
              {locale === 'en' ? 'Account settings' : 'Configuración de cuenta'}
            </a>
          </p>
          {standalone && (
            <p>
              <a href={'/' + locale + '/today'}>{text.continue}</a>
            </p>
          )}
          <button
            disabled={busy}
            onClick={async () => {
              if (unsavedNotes && !window.confirm(text.leaveUnsaved)) return;
              setBusy(true);
              setFailed(false);
              try {
                await api.signOut();
                onAccountChange(null);
                setState('guest');
                setEmail('');
                setAdultConfirmed(false);
                setSent(false);
                setInvalidLink(false);
              } catch {
                setFailed(true);
              } finally {
                setBusy(false);
              }
            }}
          >
            {text.signOut}
          </button>
        </div>
      ) : (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setFailed(false);
            setSent(false);
            try {
              await api.requestSignIn(email, adultConfirmed, locale, standalone, reauthenticate);
              setSent(true);
              setInvalidLink(false);
            } catch {
              setFailed(true);
            } finally {
              setBusy(false);
            }
          }}
        >
          {sent ? (
            <>
              <h3>{text.checkEmail}</h3>
              <p role="status">{text.sent}</p>
              <button type="button" onClick={() => setSent(false)}>
                {text.differentEmail}
              </button>
            </>
          ) : (
            <>
              <p>
                {reauthenticate
                  ? locale === 'en'
                    ? 'Confirm your identity by email. The link brings you back to account settings; you do not need to sign out.'
                    : 'Confirma tu identidad por correo. El enlace te devuelve a configuración; no necesitas cerrar sesión.'
                  : text.description}
              </p>
              {!reauthenticate && <SocialButtons locale={locale} />}
              {!reauthenticate && supportsPasskeys() && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    setFailed(false);
                    try {
                      const result = await passkeyAuth.signIn.passkey();
                      if (result.error) throw new Error('Passkey sign-in failed');
                      window.location.assign('/' + locale + '/today');
                    } catch {
                      setFailed(true);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {locale === 'en' ? 'Sign in with a passkey' : 'Entrar con una clave de acceso'}
                </button>
              )}
              <label htmlFor="account-email">{text.email}</label>
              <input
                id="account-email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                disabled={busy}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setSent(false);
                }}
              />
              <label className="adult-confirmation">
                <input
                  type="checkbox"
                  required
                  checked={adultConfirmed}
                  disabled={busy}
                  onChange={(event) => setAdultConfirmed(event.target.checked)}
                />
                {text.adult}
              </label>
              <button disabled={busy || !adultConfirmed || sent} type="submit">
                {busy ? text.sending : text.send}
              </button>
            </>
          )}
          {invalidLink && <p role="alert">{text.invalidLink}</p>}
        </form>
      )}
      {failed && <p role="alert">{text.error}</p>}
    </section>
  );
}
