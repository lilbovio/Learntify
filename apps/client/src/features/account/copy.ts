import type { Locale } from '@learntify/api-contracts';
export const accountCopy = {
  en: {
    title: 'Your Learntify account',
    signIn: 'Sign in',
    loading: 'Checking your account…',
    unavailable: 'Account access is not enabled in this preview. You can still learn for free.',
    continue: 'Continue learning',
    checkEmail: 'Check your email',
    differentEmail: 'Use another email or request a new link',
    description: 'Sign in with an email link. Lessons are free to explore without an account.',
    email: 'Email address',
    adult: 'I confirm I am 18 or older.',
    send: 'Send sign-in link',
    sending: 'Requesting link…',
    sent: 'Link requested. If this address has access, a sign-in email will arrive shortly. Its link expires in 10 minutes.',
    signedIn: 'You’re signed in. Cloud progress is not available in this preview yet.',
    signOut: 'Sign out',
    leaveUnsaved: 'Some notes are not saved. Sign out anyway?',
    error: 'We couldn’t complete this request. Try again shortly; your lesson is still available.',
    retry: 'Try again',
    invalidLink: 'This sign-in link could not be used. Request a new one.',
  },
  es: {
    title: 'Tu cuenta de Learntify',
    signIn: 'Iniciar sesión',
    loading: 'Consultando tu cuenta…',
    unavailable:
      'Las cuentas no están habilitadas en esta vista previa. Puedes seguir aprendiendo gratis.',
    continue: 'Continuar aprendiendo',
    checkEmail: 'Revisa tu correo',
    differentEmail: 'Usar otro correo o solicitar un enlace nuevo',
    description:
      'Inicia sesión con un enlace por correo. Puedes explorar las lecciones gratis sin cuenta.',
    email: 'Correo electrónico',
    adult: 'Confirmo que tengo 18 años o más.',
    send: 'Enviar enlace de acceso',
    sending: 'Solicitando enlace…',
    sent: 'Enlace solicitado. Si este correo tiene acceso, recibirás un mensaje en breve. Su enlace vence en 10 minutos.',
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
