import type { Locale } from '@learntify/api-contracts';

export function SessionRecovery({ locale }: { locale: Locale }) {
  return (
    <aside className="session-recovery">
      <p>
        {locale === 'es'
          ? 'Tu sesión terminó. Tus cambios siguen en esta pestaña. Inicia sesión con la misma cuenta en otra pestaña, vuelve aquí e intenta guardar de nuevo.'
          : 'Your session expired. Your changes are still in this tab. Sign in with the same account in another tab, then return here and try saving again.'}
      </p>
      <a href={`/${locale}/auth`} target="_blank" rel="noopener noreferrer">
        {locale === 'es' ? 'Iniciar sesión en otra pestaña' : 'Sign in in another tab'}
      </a>
    </aside>
  );
}
