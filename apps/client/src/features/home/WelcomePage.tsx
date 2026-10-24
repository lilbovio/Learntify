import { useEffect, useState } from 'react';
import { createApiClient } from '@learntify/api-client';
import type { Locale } from '@learntify/api-contracts';
import { PageFrame } from '../../shared/PageFrame';
import { lessonPath } from '../../shared/routes';
import { homeCopy } from './copy';

export function WelcomePage({ locale }: { locale: Locale }) {
  const text = homeCopy[locale];
  const [accounts, setAccounts] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    void createApiClient()
      .capabilities(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setAccounts(result.accounts);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return (
    <PageFrame locale={locale} title={text.title}>
      <div className="welcome-grid">
        <div>
          <p className="lede">{text.intro}</p>
          <p className="free-label">{text.free}</p>
          <div className="page-actions">
            <a className="primary-link" href={'/' + locale + '/start'}>
              {text.start}
            </a>
            <a href={lessonPath(locale)}>{text.sample}</a>
            {accounts && <a href={'/' + locale + '/auth'}>{text.signIn}</a>}
          </div>
        </div>
        <div className="expression-object" aria-hidden="true">
          <span>3</span>
          <b>+</b>
          <span>2</span>
          <b>=</b>
          <span className="result">5</span>
        </div>
      </div>
    </PageFrame>
  );
}
