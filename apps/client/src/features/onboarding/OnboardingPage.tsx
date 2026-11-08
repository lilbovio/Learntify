import { useEffect, useState } from 'react';
import { ApiError, createApiClient } from '@learntify/api-client';
import type { LearningPreferences, Locale } from '@learntify/api-contracts';
import { PageFrame } from '../../shared/PageFrame';
import { readGuestPreferences, saveGuestPreferences } from './preferences';
import { onboardingCopy } from './copy';
import { useUnsavedChanges } from '../../shared/useUnsavedChanges';
import { SessionRecovery } from '../../shared/SessionRecovery';

const api = createApiClient();
export function OnboardingPage({ locale }: { locale: Locale }) {
  const text = onboardingCopy[locale];
  const [values, setValues] = useState<LearningPreferences>({
    locale,
    goal: 'foundations',
    weeklyMinutes: null,
  });
  const [mode, setMode] = useState<'loading' | 'guest' | 'member' | 'failed'>('loading');
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [expired, setExpired] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [baseline, setBaseline] = useState(JSON.stringify(values));
  const { allowNavigation } = useUnsavedChanges(
    JSON.stringify(values) !== baseline || busy,
    locale,
  );
  useEffect(() => {
    const controller = new AbortController();
    setMode('loading');
    void (async () => {
      try {
        const capabilities = await api.capabilities(controller.signal);
        const account = capabilities.accounts ? await api.currentAccount(controller.signal) : null;
        if (account && !capabilities.preferences) throw new Error('Preferences unavailable');
        let stored: LearningPreferences | null = null;
        if (account) stored = await api.getPreferences(controller.signal);
        else {
          try {
            stored = readGuestPreferences(localStorage);
          } catch {
            /* Saving will report unavailable storage. */
          }
        }
        if (!controller.signal.aborted) {
          const initial = stored
            ? { ...stored, locale }
            : { locale, goal: 'foundations' as const, weeklyMinutes: null };
          setValues(initial);
          setBaseline(JSON.stringify(initial));
          setOwnerId(account?.id ?? null);
          setMode(account ? 'member' : 'guest');
        }
      } catch {
        if (!controller.signal.aborted) setMode('failed');
      }
    })();
    return () => controller.abort();
  }, [locale, reload]);
  return (
    <PageFrame
      locale={locale}
      title={text.title}
      eyebrow={locale === 'en' ? 'Starting point' : 'Punto de partida'}
      lede={text.intro}
    >
      {mode === 'loading' ? (
        <p role="status">{text.loading}</p>
      ) : mode === 'failed' ? (
        <div role="alert">
          <p>{text.error}</p>
          <button onClick={() => setReload((n) => n + 1)}>{text.retry}</button>
        </div>
      ) : (
        <form
          className="preferences-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setFailed(false);
            try {
              if (mode === 'member') {
                const account = await api.currentAccount();
                if (!account) throw new ApiError('UNAUTHENTICATED', 401);
                if (account.id !== ownerId) throw new ApiError('ACCOUNT_CHANGED', 401);
                await api.savePreferences(values);
              } else saveGuestPreferences(localStorage, values);
              allowNavigation();
              window.location.assign('/' + values.locale + '/today');
            } catch (cause) {
              setExpired(cause instanceof ApiError && cause.status === 401);
              setFailed(true);
              setBusy(false);
            }
          }}
        >
          <ol className="onboarding-progress" aria-label={text.title}>
            <li>
              <span>01</span>
              {text.language}
            </li>
            <li>
              <span>02</span>
              {text.goal}
            </li>
            <li>
              <span>03</span>
              {text.time}
            </li>
          </ol>
          <p className="preferences-context">{mode === 'member' ? text.member : text.guest}</p>
          <div className="preference-step">
            <div className="preference-step-heading">
              <span className="auth-step">01</span>
              <h2>{text.language}</h2>
            </div>
            <label htmlFor="preference-language" className="sr-only">
              {text.language}
            </label>
            <select
              id="preference-language"
              value={values.locale}
              disabled={busy}
              onChange={(event) => setValues({ ...values, locale: event.target.value as Locale })}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
          <fieldset className="preference-step" disabled={busy}>
            <legend className="sr-only">{text.goal}</legend>
            <div className="preference-step-heading">
              <span className="auth-step">02</span>
              <h2>{text.goal}</h2>
            </div>
            <div className="preference-options">
              {(['foundations', 'projects', 'interviews'] as const).map((goal) => (
                <label className="preference-choice" key={goal}>
                  <input
                    type="radio"
                    name="goal"
                    value={goal}
                    checked={values.goal === goal}
                    onChange={() => setValues({ ...values, goal })}
                  />
                  <span>{text[goal]}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="preference-step">
            <div className="preference-step-heading">
              <span className="auth-step">03</span>
              <h2>{text.time}</h2>
            </div>
            <label htmlFor="weekly-time" className="sr-only">
              {text.time}
            </label>
            <select
              id="weekly-time"
              value={values.weeklyMinutes ?? ''}
              disabled={busy}
              onChange={(event) =>
                setValues({
                  ...values,
                  weeklyMinutes: event.target.value
                    ? (Number(event.target.value) as 60 | 180 | 300)
                    : null,
                })
              }
            >
              <option value="">{text.unset}</option>
              <option value="60">{text.hour}</option>
              <option value="180">{text.three}</option>
              <option value="300">{text.five}</option>
            </select>
          </div>
          <div className="preference-save">
            <p className="preferences-context">
              {mode === 'member'
                ? locale === 'en'
                  ? 'Saving updates the preferences attached to your account. You can change them at any time.'
                  : 'Al guardar se actualizan las preferencias de tu cuenta. Puedes cambiarlas cuando quieras.'
                : locale === 'en'
                  ? 'Saving keeps these choices in this browser only. They help pick a starting point, not a grade.'
                  : 'Al guardar, estas elecciones se quedan solo en este navegador. Ayudan a elegir un punto de partida, no una nota.'}
            </p>
            <button type="submit" disabled={busy}>
              {busy ? text.saving : text.save}
            </button>
          </div>
          {failed && <p role="alert">{text.error}</p>}
          {expired && <SessionRecovery locale={locale} />}
        </form>
      )}
      <p className="onboarding-skip">
        <a href={'/' + locale + '/today'}>{text.skip}</a>
      </p>
    </PageFrame>
  );
}
