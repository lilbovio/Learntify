import type { Locale } from '@learntify/api-contracts';
import { readRoute, type Route } from './routes';

export type Screen = Route['screen'];

export type NavItem = {
  screen: Screen;
  slug: string;
  en: string;
  es: string;
};

export const primaryNav: NavItem[] = [
  { screen: 'today', slug: 'today', en: 'Today', es: 'Hoy' },
  { screen: 'learn', slug: 'learn', en: 'Learn', es: 'Aprender' },
  { screen: 'practice', slug: 'practice', en: 'Practice', es: 'Practicar' },
];

export const workNav: NavItem[] = [
  { screen: 'projects', slug: 'projects', en: 'Projects', es: 'Proyectos' },
  { screen: 'notebook', slug: 'notebook', en: 'Notebook', es: 'Cuaderno' },
  { screen: 'study-plans', slug: 'study-plans', en: 'Study plans', es: 'Planes' },
  { screen: 'progress', slug: 'progress', en: 'Progress', es: 'Progreso' },
];

export const allNav = [...primaryNav, ...workNav];

export function navLabel(item: NavItem, locale: Locale) {
  return locale === 'en' ? item.en : item.es;
}

export function navHref(locale: Locale, item: NavItem) {
  return `/${locale}/${item.slug}`;
}

export function localePath(pathname: string, locale: Locale) {
  const route = readRoute(pathname);
  if (route.screen === 'lesson' && route.lessonId)
    return `/${locale}/learn/lessons/${encodeURIComponent(route.lessonId)}`;
  if (route.screen === 'welcome' || route.screen === 'missing') return `/${locale}`;
  return `/${locale}/${route.screen}`;
}

export function isPublicScreen(screen: Screen) {
  return screen === 'welcome' || screen === 'auth' || screen === 'missing';
}

export function isCurrent(item: NavItem, screen: Screen) {
  if (item.screen === 'learn') return screen === 'learn' || screen === 'lesson';
  return item.screen === screen;
}
