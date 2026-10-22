import { useEffect, type ReactNode } from 'react';
import type { Locale } from '@learntify/api-contracts';
import { lessonPath } from './routes';

export function PageFrame({
  locale,
  title,
  children,
}: {
  locale: Locale;
  title: string;
  children: ReactNode;
}) {
  const alternate = locale === 'en' ? 'es' : 'en';
  const alternatePath = /^\/(en|es)(\/|$)/.test(window.location.pathname)
    ? window.location.pathname.replace(/^\/(en|es)/, '/' + alternate)
    : '/' + alternate;
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = title + ' · Learntify';
  }, [locale, title]);
  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        {locale === 'en' ? 'Skip to content' : 'Ir al contenido'}
      </a>
      <header className="topbar">
        <a className="brand" href={'/' + locale}>
          learntify<span aria-hidden="true">.</span>
        </a>
        <nav
          className="page-nav"
          aria-label={locale === 'en' ? 'Main navigation' : 'Navegación principal'}
        >
          <a href={'/' + locale + '/today'}>{locale === 'en' ? 'Today' : 'Hoy'}</a>
          <a href={lessonPath(locale)}>{locale === 'en' ? 'Learn' : 'Aprender'}</a>
          <a href={alternatePath} lang={alternate}>
            {alternate === 'es' ? 'Español' : 'English'}
          </a>
        </nav>
      </header>
      <main id="main" className="page-main">
        <h1>{title}</h1>
        {children}
      </main>
      <footer>Learntify · MIT · Juan Pablo Bovio Vallejo</footer>
    </div>
  );
}
