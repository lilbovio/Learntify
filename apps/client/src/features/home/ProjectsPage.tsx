import type { Locale } from '@learntify/api-contracts';
import { PageFrame } from '../../shared/PageFrame';
import { lessonPath } from '../../shared/routes';

export function ProjectsPage({ locale }: { locale: Locale }) {
  const en = locale === 'en';
  return (
    <PageFrame
      locale={locale}
      eyebrow={en ? 'Projects' : 'Proyectos'}
      title={en ? 'Put your ideas to work.' : 'Pon tus ideas en práctica.'}
      lede={
        en
          ? 'Build something small, test its behavior, and explain your decisions. No timer and no leaderboard.'
          : 'Construye algo pequeño, prueba su comportamiento y explica tus decisiones. Sin cronómetro ni clasificación.'
      }
    >
      <article className="project-feature clay-card">
        <div className="project-feature-copy">
          <span className="stage-label">
            {en ? 'Guided foundation project' : 'Proyecto guiado de fundamentos'}
          </span>
          <h2>{en ? 'Basket calculator' : 'Calculadora de cesta'}</h2>
          <p className="project-summary">
            {en
              ? 'Combine functions, loops, arrays and objects. Work from a clear contract, investigate seven checks, and practice an interview walkthrough.'
              : 'Combina funciones, bucles, arreglos y objetos. Sigue un contrato claro, investiga siete pruebas y practica cómo explicarlo en una entrevista.'}
          </p>
          <div className="page-actions">
            <a className="primary-link" href={lessonPath(locale, 'project-basket-total')}>
              {en ? 'Open project' : 'Abrir proyecto'} →
            </a>
            <a className="text-link" href={lessonPath(locale, 'building-a-basket-total')}>
              {en ? 'Review the foundations' : 'Repasar los fundamentos'}
            </a>
          </div>
        </div>
        <aside
          className="project-feature-aside"
          aria-label={en ? 'Project at a glance' : 'Resumen'}
        >
          <p className="eyebrow">{en ? 'Before you start' : 'Antes de empezar'}</p>
          <p>
            {en
              ? 'Work through functions, arrays, objects and the basket-total exercise.'
              : 'Repasa funciones, arreglos, objetos y el ejercicio del total de una cesta.'}
          </p>
          <dl className="project-facts">
            <div>
              <dt>{en ? 'Format' : 'Formato'}</dt>
              <dd>{en ? 'Self-paced project' : 'Proyecto a tu ritmo'}</dd>
            </div>
            <div>
              <dt>{en ? 'You will practice' : 'Practicarás'}</dt>
              <dd>{en ? 'Functions · Arrays · Objects' : 'Funciones · Arreglos · Objetos'}</dd>
            </div>
            <div>
              <dt>{en ? 'Review' : 'Revisión'}</dt>
              <dd>
                {en
                  ? 'Visible checks and a spoken walkthrough'
                  : 'Pruebas visibles y explicación oral'}
              </dd>
            </div>
          </dl>
        </aside>
      </article>
      <section className="project-note">
        <p className="eyebrow">{en ? 'How it works' : 'Cómo funciona'}</p>
        <p>
          {en
            ? 'The checks compare returned values in your browser. They are visible examples, not proof of mastery, and saved attempts are self-reported practice.'
            : 'Las pruebas comparan valores devueltos en tu navegador. Son ejemplos visibles, no una prueba de dominio, y los intentos guardados son práctica informada por ti.'}
        </p>
      </section>
    </PageFrame>
  );
}
