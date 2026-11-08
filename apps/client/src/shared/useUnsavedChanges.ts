import { useEffect, useRef } from 'react';
import type { Locale } from '@learntify/api-contracts';

/** Protect document navigation; callers also guard actions that replace form state. */
export function useUnsavedChanges(dirty: boolean, locale: Locale) {
  const pending = useRef(dirty);
  pending.current = dirty;
  const prompt =
    locale === 'es'
      ? 'Tienes cambios sin guardar. ¿Quieres descartarlos?'
      : 'You have unsaved changes. Discard them?';
  useEffect(() => {
    const leave = (event: BeforeUnloadEvent) => {
      if (pending.current) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    const navigate = (event: MouseEvent) => {
      if (
        !pending.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = event.target instanceof Element ? event.target.closest('a') : null;
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const destination = new URL(anchor.href, window.location.href);
      if (
        destination.origin === location.origin &&
        destination.pathname === location.pathname &&
        destination.search === location.search &&
        destination.hash
      )
        return;
      if (!window.confirm(prompt)) {
        event.preventDefault();
        event.stopPropagation();
      } else pending.current = false;
    };
    window.addEventListener('beforeunload', leave);
    document.addEventListener('click', navigate, true);
    return () => {
      window.removeEventListener('beforeunload', leave);
      document.removeEventListener('click', navigate, true);
    };
  }, [prompt]);
  return {
    confirmDiscard: () => !pending.current || window.confirm(prompt),
    allowNavigation: () => {
      pending.current = false;
    },
  };
}
