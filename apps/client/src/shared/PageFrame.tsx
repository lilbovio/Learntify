import { useEffect, type ReactNode } from 'react';
import type { Locale } from '@learntify/api-contracts';
import { AppHeader } from './AppHeader';

export function PageFrame({
  locale,
  title,
  children,
  variant = 'standard',
}: {
  locale: Locale;
  title: string;
  children: ReactNode;
  variant?: 'standard' | 'account';
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = title + ' · Learntify';
  }, [locale, title]);
  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        {locale === 'en' ? 'Skip to content' : 'Ir al contenido'}
      </a>
      <AppHeader locale={locale} />
      <main id="main" className={'page-main page-' + variant}>
        <h1>{title}</h1>
        {children}
      </main>
      <footer>Learntify · MIT · Juan Pablo Bovio Vallejo</footer>
    </div>
  );
}
