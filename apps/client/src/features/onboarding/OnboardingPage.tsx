import { useEffect, useState } from 'react';
import { createApiClient } from '@learntify/api-client';
import type { LearningPreferences, Locale } from '@learntify/api-contracts';
import { PageFrame } from '../../shared/PageFrame';
import { readGuestPreferences, saveGuestPreferences } from './preferences';
import { onboardingCopy } from './copy';

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
          if (stored) setValues({ ...stored, locale });
          setMode(account ? 'member' : 'guest');
        }
      } catch {
        if (!controller.signal.aborted) setMode('failed');
      }
    })();
    return () => controller.abort();
  }, [locale, reload]);
  return (
    <PageFrame locale={locale} title={text.title}>
      <p className="lede">{text.intro}</p>
      {mode === 'loading' ? (
        <p role="status">{text.loading}</p>
      ) : mode === 'failed' ? (
        <div role="alert">
          <p>{text.error}</p>
          <button onClick={() => setReload((n) => n + 1)}>{text.retry}</button>
        </div>
      ) : (
        <form
          className="preferences-form clay-card"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setFailed(false);
            try {
              if (mode === 'member') await api.savePreferences(values);
              else saveGuestPreferences(localStorage, values);
              window.location.assign('/' + values.locale + '/today');
            } catch {
              setFailed(true);
              setBusy(false);
            }
          }}
        >
          <p>{mode === 'member' ? text.member : text.guest}</p>
          <label htmlFor="preference-language">{text.language}</label>
          <select
            id="preference-language"
            value={values.locale}
            disabled={busy}
            onChange={(event) => setValues({ ...values, locale: event.target.value as Locale })}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
          <fieldset disabled={busy}>
            <legend>{text.goal}</legend>
            {(['foundations', 'projects', 'interviews'] as const).map((goal) => (
              <label className="preference-choice" key={goal}>
                <input
                  type="radio"
                  name="goal"
                  value={goal}
                  checked={values.goal === goal}
                  onChange={() => setValues({ ...values, goal })}
                />
                {text[goal]}
              </label>
            ))}
          </fieldset>
          <label htmlFor="weekly-time">{text.time}</label>
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
          <button type="submit" disabled={busy}>
            {busy ? text.saving : text.save}
          </button>
          {failed && <p role="alert">{text.error}</p>}
        </form>
      )}
      <p>
        <a href={'/' + locale + '/today'}>{text.skip}</a>
      </p>
    </PageFrame>
  );
}
