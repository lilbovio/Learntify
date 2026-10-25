import { ApiError } from '@learntify/api-client';

export function socialFailure(error: unknown): 'reauth' | 'session' | 'request' | 'account' {
  if (error instanceof ApiError) {
    if (error.code === 'ACCOUNT_CHANGED') return 'account';
    if (error.code === 'REAUTHENTICATION_REQUIRED') return 'reauth';
    if (error.status === 401) return 'session';
  }
  return 'request';
}

export const socialErrorCopy = {
  en: {
    account:
      'You signed in to a different account. Reload settings to review it before connecting a provider.',
    reauth: 'Identity confirmation wasn’t completed. Try your passkey again, or confirm by email.',
    session:
      'Your session is no longer available. Sign in with your passkey or email, then return to account settings.',
    request:
      'Could not load or start provider access. Check your connection and retry. Email and passkey sign-in are still available.',
  },
  es: {
    account:
      'Entraste a otra cuenta. Recarga la configuración para revisarla antes de conectar un proveedor.',
    reauth:
      'No se completó la confirmación de identidad. Reintenta con tu clave de acceso o confirma por correo.',
    session:
      'Tu sesión ya no está disponible. Entra con tu clave de acceso o correo y vuelve a configuración de cuenta.',
    request:
      'No se pudo cargar o iniciar el acceso con proveedor. Revisa tu conexión e inténtalo de nuevo. Puedes seguir entrando por correo o clave de acceso.',
  },
};
