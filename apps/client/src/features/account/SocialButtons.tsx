import { useEffect, useState } from 'react';
import { createApiClient } from '@learntify/api-client';
import type { Locale } from '@learntify/api-contracts';

const api = createApiClient();
export function SocialButtons({ locale, link = false }: { locale: Locale; link?: boolean }) {
  const [providers, setProviders] = useState<('google' | 'github')[]>([]);
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    if (link)
      void api
        .socialConnections()
        .then((result) => {
          if (active) setConnected(result);
        })
        .catch(() => {
          if (active) setFailed(true);
        });
    void api
      .socialProviders()
      .then((result) => {
        if (active) setProviders(result);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [link]);
  if (!providers.length && !failed) return null;
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
            ? 'Connect Google or GitHub using the same verified email within 15 minutes of signing in.'
            : 'Already connected a provider? Sign in here. Otherwise, sign in by email or passkey first and connect it in settings.'
          : link
            ? 'Conecta Google o GitHub con el mismo correo verificado durante los primeros 15 minutos de sesión.'
            : '¿Ya conectaste un proveedor? Entra aquí. Si no, entra por correo o clave de acceso y conéctalo en configuración.'}
      </p>
      {providers.map((provider) => (
        <button
          key={provider}
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setFailed(false);
            try {
              window.location.assign(
                await api.startSocial(link ? 'link' : 'sign-in', provider, locale),
              );
            } catch {
              setFailed(true);
              setBusy(false);
            }
          }}
        >
          {(locale === 'en'
            ? link
              ? 'Connect '
              : 'Continue with '
            : link
              ? 'Conectar '
              : 'Continuar con ') + (provider === 'google' ? 'Google' : 'GitHub')}
        </button>
      ))}
      {failed && (
        <p role="alert">
          {locale === 'en'
            ? 'Provider sign-in is unavailable. Try again after signing in by email or passkey.'
            : 'El acceso con proveedor no está disponible. Vuelve a intentarlo después de entrar por correo o clave de acceso.'}
        </p>
      )}
    </div>
  );
}
