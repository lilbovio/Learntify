import type { Locale } from '@learntify/api-contracts';
import { PageFrame } from '../../shared/PageFrame';
import { lessonPath } from '../../shared/routes';

export function ProjectsPage({ locale }: { locale: Locale }) {
  const en = locale === 'en';
  return (
    <PageFrame
      locale={locale}
      title={en ? 'Put your ideas to work.' : 'Pon tus ideas en práctica.'}
    >
      <p className="lede">
        {en
          ? 'Build something small, test its behavior, and explain your decisions. No timer and no leaderboard.'
          : 'Construye algo pequeño, prueba su comportamiento y explica tus decisiones. Sin cronómetro ni clasificación.'}
      </p>
      <section className="clay-card">
        <span className="stage-label">
          {en ? 'Guided foundation project' : 'Proyecto guiado de fundamentos'}
        </span>
        <h2>{en ? 'Basket calculator' : 'Calculadora de cesta'}</h2>
        <p>
          {en
            ? 'Combine functions, loops, arrays and objects. Work from a clear contract, investigate seven checks, and practice an interview walkthrough.'
            : 'Combina funciones, bucles, arreglos y objetos. Sigue un contrato claro, investiga siete pruebas y practica cómo explicarlo en una entrevista.'}
        </p>
        <p>
          {en
            ? 'Before starting: work through functions, arrays, objects and the basket-total exercise.'
            : 'Antes de empezar: repasa funciones, arreglos, objetos y el ejercicio del total de una cesta.'}
        </p>
        <div className="page-actions">
          <a className="primary-link" href={lessonPath(locale, 'project-basket-total')}>
            {en ? 'Open project' : 'Abrir proyecto'} →
          </a>
          <a href={lessonPath(locale, 'building-a-basket-total')}>
            {en ? 'Review the foundations' : 'Repasar los fundamentos'}
          </a>
        </div>
      </section>
    </PageFrame>
  );
}
