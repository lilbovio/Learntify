import type { Lesson, Locale } from '@learntify/api-contracts';

export function ProjectGuide({
  project,
  locale,
  review = false,
}: {
  project: NonNullable<Lesson['project']>;
  locale: Locale;
  review?: boolean;
}) {
  const en = locale === 'en';
  return review ? (
    <section className="project-review">
      <h2>{en ? 'Review and interview walkthrough' : 'Revisión y explicación para entrevistas'}</h2>
      <p>
        {en
          ? 'Explain your work aloud, then record your answers in the lesson notes below. Signed-in notes sync to your account. There is no automated interview score.'
          : 'Explica tu trabajo en voz alta y escribe tus respuestas en las notas de abajo. Con sesión iniciada, se sincronizan con tu cuenta. No hay puntuación automática de entrevista.'}
      </p>
      <ol>
        {project.reflection.map((prompt) => (
          <li key={prompt}>{prompt}</li>
        ))}
      </ol>
      <p>
        {en
          ? 'Final review: save your code attempt, explain one edge case, and choose one improvement to practice next. These steps are self-reviewed, not a completion certificate.'
          : 'Revisión final: guarda tu intento, explica un caso límite y elige una mejora para practicar después. Son pasos de autoevaluación, no un certificado.'}
      </p>
    </section>
  ) : (
    <section className="project-guide">
      <h2>{en ? 'Project brief' : 'Guía del proyecto'}</h2>
      <ul>
        {project.requirements.map((requirement) => (
          <li key={requirement}>{requirement}</li>
        ))}
      </ul>
      <h3>{en ? 'Milestones' : 'Pasos del proyecto'}</h3>
      <ol>
        {project.milestones.map((milestone) => (
          <li key={milestone}>{milestone}</li>
        ))}
      </ol>
    </section>
  );
}
