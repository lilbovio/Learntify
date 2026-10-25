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
      <section className="welcome-method">
        <span className="stage-label">
          {locale === 'en' ? 'Learn by understanding' : 'Aprende comprendiendo'}
        </span>
        <h2>
          {locale === 'en'
            ? 'Small ideas. Real understanding.'
            : 'Ideas pequeñas. Comprensión real.'}
        </h2>
        <ol className="method-steps">
          <li>
            <h3>{locale === 'en' ? '01 · Read the idea' : '01 · Lee la idea'}</h3>
            <p>
              {locale === 'en'
                ? 'Start with a clear explanation and a small example.'
                : 'Empieza con una explicación clara y un ejemplo pequeño.'}
            </p>
          </li>
          <li>
            <h3>{locale === 'en' ? '02 · Make a prediction' : '02 · Haz una predicción'}</h3>
            <p>
              {locale === 'en'
                ? 'Think through what the code will do before running it.'
                : 'Piensa qué hará el código antes de ejecutarlo.'}
            </p>
          </li>
          <li>
            <h3>{locale === 'en' ? '03 · Try it yourself' : '03 · Pruébalo tú'}</h3>
            <p>
              {locale === 'en'
                ? 'Change the code, compare the result, and revisit what you learned.'
                : 'Cambia el código, compara el resultado y repasa lo aprendido.'}
            </p>
          </li>
        </ol>
        <a href={'/' + locale + '/learn'}>
          {locale === 'en' ? 'Explore the learning path' : 'Explorar la ruta de aprendizaje'} →
        </a>
      </section>
    </PageFrame>
  );
}
