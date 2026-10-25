import { useEffect, useState } from 'react';
import { createApiClient } from '@learntify/api-client';
import type { Locale } from '@learntify/api-contracts';
import { socialFailure, socialErrorCopy } from './social-errors';
import { connectProvider } from './connect-provider';
import { passkeyAuth, supportsPasskeys } from './passkeys';

const api = createApiClient();
export function SocialButtons({ locale, link = false }: { locale: Locale; link?: boolean }) {
  const [providers, setProviders] = useState<('google' | 'github')[]>([]);
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState<string[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [failure, setFailure] = useState<ReturnType<typeof socialFailure> | null>(null);
  useEffect(() => {
    let active = true;
    if (link)
      void api
        .socialConnections()
        .then((result) => {
          if (active) setConnected(result);
        })
        .catch((cause) => {
          if (active) setFailure(socialFailure(cause));
        });
    void api
      .socialProviders()
      .then((result) => {
        if (active) setProviders(result);
      })
      .catch((cause) => {
        if (active) setFailure(socialFailure(cause));
      });
    return () => {
      active = false;
    };
  }, [link]);
  if (!providers.length && !failure) return null;
  return (
    <div className="social-providers">
      {connected.length > 0 && (
        <p role="status">
          {locale === 'en' ? 'Connected: ' : 'Conectados: '}
          {connected.map((provider) => (provider === 'google' ? 'Google' : 'GitHub')).join(', ')}
        </p>
      )}
      <p>
        {locale === 'en'
          ? link
            ? 'Choose another way to sign in. Use the same verified email as your Learntify account.'
            : 'Already connected a provider? Sign in here. Otherwise, sign in by email or passkey first and connect it in settings.'
          : link
            ? 'Elige otra forma de entrar. Usa el mismo correo verificado de tu cuenta de Learntify.'
            : '¿Ya conectaste un proveedor? Entra aquí. Si no, entra por correo o clave de acceso y conéctalo en configuración.'}
      </p>
      {providers.map((provider) => (
        <button
          key={provider}
          type="button"
          disabled={busy || (link && connected.includes(provider))}
          onClick={async () => {
            setBusy(true);
            setFailure(null);
            setVerifying(false);
            try {
              const start = () => api.startSocial(link ? 'link' : 'sign-in', provider, locale);
              const url = link
                ? await connectProvider({
                    start,
                    currentAccount: () => api.currentAccount(),
                    verify: () =>
                      supportsPasskeys()
                        ? passkeyAuth.signIn.passkey()
                        : Promise.resolve({ error: true }),
                    onVerify: () => setVerifying(true),
                  })
                : await start();
              window.location.assign(url);
            } catch (cause) {
              setFailure(socialFailure(cause));
              setBusy(false);
              setVerifying(false);
            }
          }}
        >
          {link && connected.includes(provider)
            ? (provider === 'google' ? 'Google' : 'GitHub') +
              (locale === 'en' ? ' — Connected' : ' — Conectado')
            : (locale === 'en'
                ? link
                  ? 'Connect '
                  : 'Continue with '
                : link
                  ? 'Conectar '
                  : 'Continuar con ') + (provider === 'google' ? 'Google' : 'GitHub')}
        </button>
      ))}
      {verifying && (
        <p role="status">
          {locale === 'en'
            ? 'Confirm it’s you with your passkey. We’ll continue automatically.'
            : 'Confirma tu identidad con tu clave de acceso. Continuaremos automáticamente.'}
        </p>
      )}
      {failure && <p role="alert">{socialErrorCopy[locale][failure]}</p>}
      {link && failure === 'reauth' && (
        <a href={'/' + locale + '/auth?reauth=1'}>
          {locale === 'en' ? 'Confirm by email instead' : 'Confirmar por correo'}
        </a>
      )}
    </div>
  );
}
