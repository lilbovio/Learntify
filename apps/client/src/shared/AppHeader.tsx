import type { Locale } from '@learntify/api-contracts';

export function AppHeader({
  locale,
  onLocaleChange,
}: {
  locale: Locale;
  onLocaleChange?: (locale: Locale) => void;
}) {
  const path = window.location.pathname;
  const alternate = locale === 'en' ? 'es' : 'en';
  const alternatePath = /^\/(en|es)(\/|$)/.test(path)
    ? path.replace(/^\/(en|es)/, '/' + alternate)
    : '/' + alternate;
  const links = [
    ['today', 'Today', 'Hoy'],
    ['learn', 'Learn', 'Aprender'],
    ['practice', 'Practice', 'Practicar'],
    ['progress', 'Progress', 'Progreso'],
    ['notebook', 'Notebook', 'Cuaderno'],
    ['projects', 'Projects', 'Proyectos'],
  ];
  return (
    <header className="topbar">
      <a className="brand" href={'/' + locale}>
        learntify<span aria-hidden="true">.</span>
      </a>
      <nav
        className="page-nav"
        aria-label={locale === 'en' ? 'Main navigation' : 'Navegación principal'}
      >
        {links.map(([slug, en, es]) => (
          <a
            key={slug}
            href={`/${locale}/${slug}`}
            aria-current={
              path === `/${locale}/${slug}` || (slug === 'learn' && path.includes('/learn/'))
                ? 'page'
                : undefined
            }
          >
            {locale === 'en' ? en : es}
          </a>
        ))}
      </nav>
      <div className="header-tools">
        {onLocaleChange ? (
          <label className="language">
            {locale === 'en' ? 'Language' : 'Idioma'}
            <select
              value={locale}
              onChange={(event) => onLocaleChange(event.target.value as Locale)}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </label>
        ) : (
          <a href={alternatePath} lang={alternate}>
            {alternate === 'es' ? 'Español' : 'English'}
          </a>
        )}
      </div>
    </header>
  );
}
