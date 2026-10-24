import type { Locale } from '@learntify/api-contracts';
export const draftCopy = {
  en: {
    title: 'Your lesson notes',
    hint: 'Explain this idea in your own words. Notes save automatically to your account.',
    loading: 'Opening saved notes…',
    saved: 'Notes saved to your account.',
    pending: 'Changes waiting to save…',
    saving: 'Saving notes…',
    error: 'Notes could not sync. Keep this tab open and retry.',
    conflict: 'These notes changed on another device. Compare both versions before choosing.',
    remote: 'Saved version from the other device',
    keep: 'Keep my version',
    useRemote: 'Use the saved version',
    retry: 'Retry notes sync',
    leave: 'Some notes are not saved. Leave this lesson anyway?',
  },
  es: {
    title: 'Tus notas de la lección',
    hint: 'Explica esta idea con tus palabras. Las notas se guardan automáticamente en tu cuenta.',
    loading: 'Abriendo notas guardadas…',
    saved: 'Notas guardadas en tu cuenta.',
    pending: 'Cambios pendientes de guardar…',
    saving: 'Guardando notas…',
    error:
      'No se pudieron sincronizar las notas. Mantén esta pestaña abierta e inténtalo de nuevo.',
    conflict: 'Las notas cambiaron en otro dispositivo. Compara ambas versiones antes de elegir.',
    remote: 'Versión guardada desde el otro dispositivo',
    keep: 'Conservar mi versión',
    useRemote: 'Usar la versión guardada',
    retry: 'Reintentar sincronización',
    leave: 'Hay notas sin guardar. ¿Quieres salir de esta lección de todos modos?',
  },
} satisfies Record<Locale, Record<string, string>>;
