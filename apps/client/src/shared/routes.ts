import type { Locale } from '@learntify/api-contracts';
export type Route = {
  locale: Locale;
  screen: 'welcome' | 'auth' | 'start' | 'today' | 'settings' | 'lesson' | 'missing';
  lessonId?: string;
};
export function readRoute(pathname: string, search = ''): Route {
  const parts = pathname.replace(/\/$/, '').split('/').filter(Boolean);
  const locale: Locale =
    parts[0] === 'es' || (!parts.length && new URLSearchParams(search).get('lang') === 'es')
      ? 'es'
      : 'en';
  if (!parts.length) return { locale, screen: 'welcome' };
  if (parts[0] !== 'en' && parts[0] !== 'es') return { locale, screen: 'missing' };
  if (parts.length === 1) return { locale, screen: 'welcome' };
  if (parts.length === 2 && ['auth', 'start', 'today', 'settings'].includes(parts[1]!))
    return { locale, screen: parts[1] as 'auth' | 'start' | 'today' | 'settings' };
  if (
    parts.length === 4 &&
    parts[1] === 'learn' &&
    parts[2] === 'lessons' &&
    /^[a-z0-9-]+$/.test(parts[3]!)
  )
    return { locale, screen: 'lesson', lessonId: parts[3]! };
  return { locale, screen: 'missing' };
}
export function lessonPath(locale: Locale, id = 'values-and-expressions') {
  return `/${locale}/learn/lessons/${encodeURIComponent(id)}`;
}
