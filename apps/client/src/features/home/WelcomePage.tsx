import { useEffect, useState } from 'react';
import { createApiClient } from '@learntify/api-client';
import type { Locale } from '@learntify/api-contracts';
import { PageFrame } from '../../shared/PageFrame';
import { lessonPath } from '../../shared/routes';
import { homeCopy } from './copy';

export function WelcomePage({ locale }: { locale: Locale }) {
  const text = homeCopy[locale];
  const en = locale === 'en';
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
    <PageFrame
      locale={locale}
      eyebrow={en ? 'A free JavaScript workshop' : 'Un taller gratuito de JavaScript'}
      title={text.title}
    >
      <section className="welcome-hero">
        <div className="welcome-copy">
          <p className="lede">{text.intro}</p>
          <div className="page-actions">
            <a className="primary-link" href={'/' + locale + '/start'}>
              {text.start}
            </a>
            <a className="text-link" href={lessonPath(locale)}>
              {en ? 'Open the first lesson' : 'Abrir la primera lección'}
              <span aria-hidden="true"> →</span>
            </a>
          </div>
          <p className="welcome-note">
            {en
              ? 'No timer, no leaderboard, no account needed to start.'
              : 'Sin cronómetro, sin clasificación y sin cuenta para empezar.'}
          </p>
          {accounts && (
            <p className="welcome-signin">
              {en ? 'Already learning with an account?' : '¿Ya aprendes con una cuenta?'}{' '}
              <a href={'/' + locale + '/auth'}>{en ? 'Sign in here' : 'Inicia sesión aquí'}</a>
            </p>
          )}
        </div>
        <aside className="lesson-preview" aria-label={en ? 'First lesson preview' : 'Vista previa'}>
          <div className="preview-margin" aria-hidden="true">
            <span>Predict</span>
            <span>Run</span>
            <span>Explain</span>
          </div>
          <div className="preview-body">
            <p className="preview-kicker">
              {en
                ? 'First lesson · Values and expressions'
                : 'Primera lección · Valores y expresiones'}
            </p>
            <pre className="preview-code">
              <code>
                <span className="code-line-number">1</span>2 + 3
              </code>
            </pre>
            <div className="preview-output">
              <span>{en ? 'Output' : 'Resultado'}</span>
              <samp>5</samp>
            </div>
            <p className="preview-explain">
              {en
                ? 'JavaScript works out the expression first. 2 + 3 becomes 5, and console.log prints that value so you can see it.'
                : 'JavaScript resuelve primero la expresión. 2 + 3 se convierte en 5, y console.log muestra ese valor para que puedas verlo.'}
            </p>
            <a href={lessonPath(locale)}>
              {en ? 'Try the real lesson' : 'Probar la lección real'} →
            </a>
          </div>
        </aside>
      </section>

      <section className="welcome-method" aria-labelledby="method-title">
        <div className="section-heading">
          <p className="eyebrow">{en ? 'How Learntify works' : 'Cómo funciona Learntify'}</p>
          <h2 id="method-title">
            {en ? 'Small ideas. Real understanding.' : 'Ideas pequeñas. Comprensión real.'}
          </h2>
          <p className="lede">
            {en
              ? 'Every lesson follows the same steady rhythm. You can pause, revisit, or start again without losing progress.'
              : 'Cada lección sigue el mismo ritmo tranquilo. Puedes pausar, repasar o empezar de nuevo sin perder tu avance.'}
          </p>
        </div>
        <ol className="method-steps">
          <li>
            <span className="method-number">01</span>
            <h3>{en ? 'Predict' : 'Predice'}</h3>
            <p>
              {en
                ? 'Look at a small expression and decide what you think will happen before running it.'
                : 'Mira una expresión pequeña y decide qué crees que ocurrirá antes de ejecutarla.'}
            </p>
          </li>
          <li>
            <span className="method-number">02</span>
            <h3>{en ? 'Run' : 'Ejecuta'}</h3>
            <p>
              {en
                ? 'Change the code in your browser, run it, and compare the real output with your prediction.'
                : 'Cambia el código en tu navegador, ejecútalo y compara el resultado real con tu predicción.'}
            </p>
          </li>
          <li>
            <span className="method-number">03</span>
            <h3>{en ? 'Explain' : 'Explica'}</h3>
            <p>
              {en
                ? 'Write the idea in your own words. Explaining is how a lesson becomes yours.'
                : 'Escribe la idea con tus palabras. Explicarla es cómo una lección se vuelve tuya.'}
            </p>
          </li>
        </ol>
      </section>

      <section className="welcome-learn" aria-labelledby="learn-title">
        <div className="section-heading">
          <p className="eyebrow">{en ? 'Start here' : 'Empieza aquí'}</p>
          <h2 id="learn-title">{en ? 'What you will learn first' : 'Lo que aprenderás primero'}</h2>
        </div>
        <div className="learn-grid">
          <div>
            <h3>{en ? 'Values and expressions' : 'Valores y expresiones'}</h3>
            <p>
              {en
                ? 'See how numbers and text become values, and how a small expression produces a result.'
                : 'Descubre cómo los números y el texto se convierten en valores, y cómo una expresión produce un resultado.'}
            </p>
            <a href={lessonPath(locale)}>
              {en ? 'Begin the first lesson' : 'Comenzar la primera lección'} →
            </a>
          </div>
          <div>
            <h3>{en ? 'Variables and decisions' : 'Variables y decisiones'}</h3>
            <p>
              {en
                ? 'Store a value, change it, and use a condition to choose what your program does next.'
                : 'Guarda un valor, cámbialo y usa una condición para elegir qué hace tu programa después.'}
            </p>
            <a href={'/' + locale + '/learn'}>
              {en ? 'See the learning path' : 'Ver la ruta de aprendizaje'} →
            </a>
          </div>
          <div>
            <h3>{en ? 'Projects and review' : 'Proyectos y repaso'}</h3>
            <p>
              {en
                ? 'When you are ready, build a small project and revisit ideas at a pace that works for you.'
                : 'Cuando estés listo, crea un proyecto pequeño y repasa las ideas a un ritmo que te funcione.'}
            </p>
            <a href={'/' + locale + '/projects'}>
              {en ? 'See the guided project' : 'Ver el proyecto guiado'} →
            </a>
          </div>
        </div>
        <p className="free-label">{text.free}</p>
      </section>
    </PageFrame>
  );
}
