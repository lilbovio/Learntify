import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { createApiClient } from '@learntify/api-client';
import type { Locale } from '@learntify/api-contracts';
import { readRoute } from './routes';
import {
  isCurrent,
  isPublicScreen,
  localePath,
  navHref,
  navLabel,
  primaryNav,
  workNav,
  type NavItem,
} from './nav';
import { notifySessionChange } from './session-events';
import { confirmSignOut } from './unsaved-work';
import { useAccountStatus } from './useAccountStatus';

const api = createApiClient();

export function AppHeader({
  locale,
  onLocaleChange,
}: {
  locale: Locale;
  onLocaleChange?: (locale: Locale) => void;
}) {
  const route = readRoute(window.location.pathname, window.location.search);
  const pathname = window.location.pathname;
  const alternate: Locale = locale === 'en' ? 'es' : 'en';
  const alternatePath = localePath(pathname, alternate);
  const publicScreen = isPublicScreen(route.screen);
  const account = useAccountStatus();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [signOutFailed, setSignOutFailed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const accountTriggerRef = useRef<HTMLButtonElement>(null);
  const accountPanelRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const t = (en: string, es: string) => (locale === 'en' ? en : es);

  useEffect(() => {
    if (!menuOpen) return;
    const trigger = triggerRef.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    const focusable = () =>
      Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    window.setTimeout(() => focusable()[0]?.focus(), 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      (previous ?? trigger)?.focus();
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!accountOpen) return;
    const items = () =>
      Array.from(accountPanelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    items()[0]?.focus();
    const onPointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !accountPanelRef.current?.contains(event.target) &&
        !accountTriggerRef.current?.contains(event.target)
      )
        setAccountOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        const entries = items();
        if (!entries.length) return;
        event.preventDefault();
        const current = entries.indexOf(document.activeElement as HTMLElement);
        const next =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? entries.length - 1
              : (current + (event.key === 'ArrowDown' ? 1 : -1) + entries.length) % entries.length;
        entries[next]?.focus();
        return;
      }
      if (event.key === 'Tab') {
        setAccountOpen(false);
        accountTriggerRef.current?.focus();
        return;
      }
      if (event.key !== 'Escape') return;
      setAccountOpen(false);
      accountTriggerRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [accountOpen]);

  async function signOut() {
    if (signingOut) return;
    if (
      !confirmSignOut(
        t(
          'You have unsaved changes. Sign out anyway?',
          'Tienes cambios sin guardar. ¿Quieres cerrar sesión de todos modos?',
        ),
      )
    )
      return;
    setSigningOut(true);
    setSignOutFailed(false);
    try {
      await api.signOut();
      notifySessionChange();
      setAccountOpen(false);
      setMenuOpen(false);
    } catch {
      setSignOutFailed(true);
    } finally {
      setSigningOut(false);
    }
  }

  function group(label: string, items: NavItem[]) {
    return (
      <nav className="drawer-group" aria-label={label}>
        <p className="drawer-group-label">{label}</p>
        {items.map((item) => (
          <a
            key={item.slug}
            className="drawer-link"
            href={navHref(locale, item)}
            aria-current={isCurrent(item, route.screen) ? 'page' : undefined}
          >
            {navLabel(item, locale)}
          </a>
        ))}
      </nav>
    );
  }

  function desktopNav() {
    if (publicScreen)
      return (
        <nav className="nav-desktop" aria-label={t('Public navigation', 'Navegación pública')}>
          <a
            className="nav-link"
            href={`/${locale}/learn`}
            aria-current={route.screen === 'learn' ? 'page' : undefined}
          >
            {t('Learn', 'Aprender')}
          </a>
        </nav>
      );
    return (
      <nav className="nav-desktop" aria-label={t('Main navigation', 'Navegación principal')}>
        <div className="nav-group">
          {primaryNav.map((item) => (
            <a
              key={item.slug}
              className="nav-link"
              href={navHref(locale, item)}
              aria-current={isCurrent(item, route.screen) ? 'page' : undefined}
            >
              {navLabel(item, locale)}
            </a>
          ))}
        </div>
        <span className="nav-divider" aria-hidden="true" />
        <div className="nav-group">
          {workNav.map((item) => (
            <a
              key={item.slug}
              className="nav-link"
              href={navHref(locale, item)}
              aria-current={isCurrent(item, route.screen) ? 'page' : undefined}
            >
              {navLabel(item, locale)}
            </a>
          ))}
        </div>
      </nav>
    );
  }

  function languageControl(extraClass = '') {
    if (onLocaleChange)
      return (
        <label className={'language-control ' + extraClass}>
          <span>{t('Language', 'Idioma')}</span>
          <select
            aria-label={t('Language', 'Idioma')}
            value={locale}
            onChange={(event) => onLocaleChange(event.target.value as Locale)}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </label>
      );
    return (
      <a className={'language-link ' + extraClass} href={alternatePath} lang={alternate}>
        {alternate === 'es' ? 'Español' : 'English'}
      </a>
    );
  }

  const showSignIn = account.status === 'signedOut' && !publicScreen && route.screen !== 'settings';

  return (
    <>
      <div className="app-header-wrap">
        <header className="app-header">
          <a className="brand" href={'/' + locale}>
            learntify<span aria-hidden="true">.</span>
          </a>
          <span className="brand-rule" aria-hidden="true" />
          <span className="brand-context">{t('Learn JavaScript', 'Aprende JavaScript')}</span>
          {desktopNav()}
          <div className="header-tools">
            {languageControl('header-language')}
            {account.status === 'signedIn' && (
              <div className="account-wrap">
                <button
                  ref={accountTriggerRef}
                  className="account-trigger"
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  aria-controls="account-menu"
                  aria-label={t('Account menu', 'Menú de cuenta')}
                  onClick={() => setAccountOpen((value) => !value)}
                >
                  {t('Account', 'Cuenta')}
                  <span aria-hidden="true">⌄</span>
                </button>
                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      ref={accountPanelRef}
                      id="account-menu"
                      className="account-popover"
                      role="menu"
                      initial={{ opacity: 0, y: reduced ? 0 : -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: reduced ? 0 : -4 }}
                      transition={{ duration: reduced ? 0 : 0.13 }}
                    >
                      <a role="menuitem" href={'/' + locale + '/settings'}>
                        {t('Settings', 'Configuración')}
                      </a>
                      <button
                        role="menuitem"
                        type="button"
                        disabled={signingOut}
                        onClick={() => void signOut()}
                      >
                        {t('Sign out', 'Cerrar sesión')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            {showSignIn && (
              <a className="header-signin" href={'/' + locale + '/auth'}>
                {t('Sign in', 'Iniciar sesión')}
              </a>
            )}
            {publicScreen && account.status === 'signedOut' && route.screen !== 'auth' && (
              <a className="header-signin" href={'/' + locale + '/auth'}>
                {t('Sign in', 'Iniciar sesión')}
              </a>
            )}
            <button
              ref={triggerRef}
              className="menu-trigger"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(true)}
            >
              <span className="menu-icon" aria-hidden="true">
                <span />
                <span />
              </span>
              {t('Menu', 'Menú')}
            </button>
          </div>
        </header>
        {signOutFailed && (
          <p role="alert" className="error-text">
            {t(
              'Could not sign out. Please try again.',
              'No se pudo cerrar sesión. Inténtalo de nuevo.',
            )}
          </p>
        )}
      </div>
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.18 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              ref={drawerRef}
              id="mobile-menu"
              className="mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label={t('Menu', 'Menú')}
              initial={{ x: reduced ? 0 : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: reduced ? 0 : '100%' }}
              transition={{ duration: reduced ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="drawer-head">
                <span className="brand">
                  learntify<span aria-hidden="true">.</span>
                </span>
                <button type="button" className="drawer-close" onClick={() => setMenuOpen(false)}>
                  {t('Close', 'Cerrar')}
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="drawer-body">
                {group(t('Study', 'Estudiar'), primaryNav)}
                {group(t('Your work', 'Tu trabajo'), workNav)}
                <div className="drawer-group" aria-label={t('Account', 'Cuenta')}>
                  <p className="drawer-group-label">{t('Account', 'Cuenta')}</p>
                  {account.status === 'signedIn' ? (
                    <>
                      <a className="drawer-link" href={'/' + locale + '/settings'}>
                        {t('Settings', 'Configuración')}
                      </a>
                      <button
                        className="drawer-link drawer-button"
                        type="button"
                        disabled={signingOut}
                        onClick={() => void signOut()}
                      >
                        {t('Sign out', 'Cerrar sesión')}
                      </button>
                    </>
                  ) : account.status === 'signedOut' ? (
                    <a className="drawer-link" href={'/' + locale + '/auth'}>
                      {t('Sign in', 'Iniciar sesión')}
                    </a>
                  ) : (
                    <p className="drawer-note">
                      {account.status === 'disabled'
                        ? t(
                            'Accounts are not enabled in this preview.',
                            'Las cuentas no están habilitadas en esta vista previa.',
                          )
                        : t('Checking your account…', 'Consultando tu cuenta…')}
                    </p>
                  )}
                </div>
                <div className="drawer-footer">{languageControl('drawer-language')}</div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
