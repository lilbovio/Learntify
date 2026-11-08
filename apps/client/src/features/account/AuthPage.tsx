import { useState } from 'react';
import type { Locale } from '@learntify/api-contracts';
import { PageFrame } from '../../shared/PageFrame';
import { AccountPanel } from './AccountPanel';

export function AuthPage({ locale }: { locale: Locale }) {
  const [, setAccount] = useState<string | null>(null);
  return (
    <PageFrame
      locale={locale}
      variant="account"
      eyebrow={locale === 'en' ? 'Account' : 'Cuenta'}
      title={locale === 'en' ? 'A place for your learning.' : 'Un lugar para tu aprendizaje.'}
      lede={
        locale === 'en'
          ? 'Save your work, return on any device, and build a learning habit. Always free.'
          : 'Guarda tu trabajo, vuelve desde cualquier dispositivo y crea un hábito de aprendizaje. Siempre gratis.'
      }
    >
      <AccountPanel locale={locale} onAccountChange={setAccount} unsavedNotes={false} standalone />
      <p className="onboarding-skip">
        <a href={'/' + locale + '/start'}>
          {locale === 'en' ? 'Continue without an account' : 'Continuar sin cuenta'} →
        </a>
      </p>
    </PageFrame>
  );
}
