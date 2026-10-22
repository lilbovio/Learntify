import { useEffect, useState } from 'react';
import { createApiClient } from '@learntify/api-client';
import type { Locale } from '@learntify/api-contracts';
import { accountCopy } from './copy';

const api = createApiClient();
export function AccountPanel({
  locale,
  onAccountChange,
  unsavedNotes,
}: {
  locale: Locale;
  onAccountChange: (id: string | null) => void;
  unsavedNotes: boolean;
}) {
  const text = accountCopy[locale];
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
          setState(account ? 'member' : 'guest');
          onAccountChange(capabilities.cloudDrafts ? (account?.id ?? null) : null);
        }
      } catch {
        if (!controller.signal.aborted) setState('failed');
      }
    })();
    return () => controller.abort();
  }, [refresh, onAccountChange]);
  if (state === 'loading' || state === 'disabled') return null;
  return (
    <section className="account-panel" aria-labelledby="account-title">
      <h2 id="account-title">{text.title}</h2>
      {state === 'failed' ? (
        <div role="alert">
          <p>{text.error}</p>
          <button onClick={() => setRefresh((value) => value + 1)}>{text.retry}</button>
        </div>
      ) : state === 'member' ? (
        <div>
          <p role="status">{text.signedIn}</p>
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
              await api.requestSignIn(email, adultConfirmed, locale);
              setSent(true);
              setInvalidLink(false);
            } catch {
              setFailed(true);
            } finally {
              setBusy(false);
            }
          }}
        >
          <p>{text.description}</p>
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
          {sent && <p role="status">{text.sent}</p>}
          {invalidLink && <p role="alert">{text.invalidLink}</p>}
        </form>
      )}
      {failed && <p role="alert">{text.error}</p>}
    </section>
  );
}
