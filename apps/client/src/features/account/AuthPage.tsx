import { useState } from 'react';
import type { Locale } from '@learntify/api-contracts';
import { PageFrame } from '../../shared/PageFrame';
import { AccountPanel } from './AccountPanel';

export function AuthPage({ locale }: { locale: Locale }) {
  const [, setAccount] = useState<string | null>(null);
  return (
    <PageFrame
      locale={locale}
      title={locale === 'en' ? 'A place for your learning.' : 'Un lugar para tu aprendizaje.'}
    >
      <AccountPanel locale={locale} onAccountChange={setAccount} unsavedNotes={false} standalone />
      <a href={'/' + locale + '/start'}>
        {locale === 'en' ? 'Continue without an account' : 'Continuar sin cuenta'}
      </a>
    </PageFrame>
  );
}
