import { ApiError } from '@learntify/api-client';

export function socialFailure(error: unknown): 'reauth' | 'session' | 'request' {
  if (error instanceof ApiError) {
    if (error.code === 'REAUTHENTICATION_REQUIRED') return 'reauth';
    if (error.status === 401) return 'session';
  }
  return 'request';
}

export const socialErrorCopy = {
  en: {
    reauth:
      'For your security, connecting a provider requires a sign-in within the last 15 minutes. Sign out, sign in with your passkey or email, then return here to connect it.',
    session:
      'Your session is no longer available. Sign in with your passkey or email, then return to account settings.',
    request:
      'Could not load or start provider access. Check your connection and retry. Email and passkey sign-in are still available.',
  },
  es: {
    reauth:
      'Por seguridad, conectar un proveedor requiere haber iniciado sesión en los últimos 15 minutos. Cierra sesión, entra con tu clave de acceso o correo y vuelve aquí para conectarlo.',
    session:
      'Tu sesión ya no está disponible. Entra con tu clave de acceso o correo y vuelve a configuración de cuenta.',
    request:
      'No se pudo cargar o iniciar el acceso con proveedor. Revisa tu conexión e inténtalo de nuevo. Puedes seguir entrando por correo o clave de acceso.',
  },
};
