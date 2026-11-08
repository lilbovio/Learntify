import { useEffect, type ReactNode } from 'react';
import type { Locale } from '@learntify/api-contracts';
import { AppHeader } from './AppHeader';

export function PageFrame({
  locale,
  title,
  eyebrow,
  lede,
  children,
  variant = 'standard',
}: {
  locale: Locale;
  title: string;
  eyebrow?: string;
  lede?: string;
  children: ReactNode;
  variant?: 'standard' | 'account' | 'wide';
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = title + ' · Learntify';
  }, [locale, title]);
  return (
    <div className="shell app-shell">
      <a className="skip-link" href="#main-content">
        {locale === 'en' ? 'Skip to content' : 'Ir al contenido'}
      </a>
      <AppHeader locale={locale} />
      <main id="main-content" className={'page-main page-' + variant}>
        <header className="page-heading">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          {lede && <p className="lede">{lede}</p>}
        </header>
        {children}
      </main>
      <footer className="site-footer">
        <span>
          Learntify<span aria-hidden="true">.</span>
        </span>
        <span>
          {locale === 'en'
            ? 'Free to learn. MIT licensed. Built in the open.'
            : 'Gratis para aprender. Licencia MIT. Creado en abierto.'}
        </span>
        <span>Juan Pablo Bovio Vallejo</span>
      </footer>
    </div>
  );
}
