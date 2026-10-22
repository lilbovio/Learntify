import type { Locale } from '@learntify/api-contracts';
export const accountCopy = {
  en: {
    title: 'Your Learntify account',
    description: 'Sign in with an email link. Lessons are free to explore without an account.',
    email: 'Email address',
    adult: 'I confirm I am 18 or older.',
    send: 'Send sign-in link',
    sending: 'Requesting link…',
    sent: 'Link requested. Open it from your email to continue. It expires in 10 minutes.',
    signedIn: 'You’re signed in. Cloud progress is not available in this preview yet.',
    signOut: 'Sign out',
    leaveUnsaved: 'Some notes are not saved. Sign out anyway?',
    error: 'We couldn’t complete this request. Try again shortly; your lesson is still available.',
    retry: 'Try again',
    invalidLink: 'This sign-in link could not be used. Request a new one.',
  },
  es: {
    title: 'Tu cuenta de Learntify',
    description:
      'Inicia sesión con un enlace por correo. Puedes explorar las lecciones gratis sin cuenta.',
    email: 'Correo electrónico',
    adult: 'Confirmo que tengo 18 años o más.',
    send: 'Enviar enlace de acceso',
    sending: 'Solicitando enlace…',
    sent: 'Enlace solicitado. Ábrelo desde tu correo para continuar. Vence en 10 minutos.',
    signedIn:
      'Iniciaste sesión. El progreso en la nube aún no está disponible en esta vista previa.',
    signOut: 'Cerrar sesión',
    leaveUnsaved: 'Hay notas sin guardar. ¿Quieres cerrar sesión de todos modos?',
    error:
      'No pudimos completar la solicitud. Inténtalo en un momento; tu lección sigue disponible.',
    retry: 'Intentar de nuevo',
    invalidLink: 'No se pudo usar este enlace. Solicita uno nuevo.',
  },
} satisfies Record<Locale, Record<string, string>>;
