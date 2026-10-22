export type ContentLocale = 'en' | 'es';

type LessonData = {
  id: string;
  version: number;
  title: { en: string; es: string };
  objective: { en: string; es: string };
  explanation: { en: string[]; es: string[] };
  example: string;
  exercise: {
    id: string;
    prompt: { en: string; es: string };
    choices: Array<{ id: string; label: string }>;
    correctChoice: string;
  };
  feedback: { en: string; es: string };
  nextStep: { en: string; es: string };
};

const lessons: LessonData[] = [
  {
    id: 'values-and-expressions',
    version: 1,
    title: {
      en: 'Values become expressions',
      es: 'De valores a expresiones',
    },
    objective: {
      en: 'Predict a value before running a program.',
      es: 'Predice un valor antes de ejecutar un programa.',
    },
    explanation: {
      en: [
        'A value is a piece of information, such as the number 3 or the text "hello".',
        'An expression produces a value. JavaScript evaluates 3 + 2 to produce 5.',
        'console.log displays a value. The quotation marks in a string describe text; they are not part of the displayed message.',
      ],
      es: [
        'Un valor es un dato, como el número 3 o el texto "hola".',
        'Una expresión produce un valor. JavaScript evalúa 3 + 2 y obtiene 5.',
        'console.log muestra un valor. Las comillas de una cadena delimitan el texto; no forman parte del mensaje mostrado.',
      ],
    },
    example: 'console.log(3 + 2);',
    exercise: {
      id: 'predict-addition-v1',
      prompt: {
        en: 'What will this program display?',
        es: '¿Qué mostrará este programa?',
      },
      choices: [
        { id: 'five', label: '5' },
        { id: 'expression', label: '3 + 2' },
        { id: 'thirty-two', label: '32' },
      ],
      correctChoice: 'five',
    },
    feedback: {
      en: 'JavaScript adds the numbers 3 and 2 first. console.log then displays the result: 5.',
      es: 'JavaScript suma primero los números 3 y 2. Después, console.log muestra el resultado: 5.',
    },
    nextStep: {
      en: 'Explain what would change if the expression were 3 + 4. Predict it before running it.',
      es: 'Explica qué cambiaría si la expresión fuera 3 + 4. Predice el resultado antes de ejecutarlo.',
    },
  },
  {
    id: 'storing-values',
    version: 1,
    title: {
      en: 'Storing values with variables',
      es: 'Guardar valores con variables',
    },
    objective: {
      en: 'Use let to store and reuse a value.',
      es: 'Usa let para guardar y reutilizar un valor.',
    },
    explanation: {
      en: [
        'A variable is a named container for a value.',
        'Use let to declare a variable you may change later.',
        'Reading a variable gives its current value when the expression is evaluated.',
      ],
      es: [
        'Una variable es un contenedor con nombre para un valor.',
        'Usa let para declarar una variable que puedes cambiar más tarde.',
        'Al leer una variable obtienes su valor actual cuando se evalúa la expresión.',
      ],
    },
    example: 'let score = 10;\nconsole.log(score);',
    exercise: {
      id: 'predict-variable-v1',
      prompt: {
        en: 'What will this program display?',
        es: '¿Qué mostrará este programa?',
      },
      choices: [
        { id: 'ten', label: '10' },
        { id: 'score', label: 'score' },
        { id: 'undefined', label: 'undefined' },
      ],
      correctChoice: 'ten',
    },
    feedback: {
      en: 'The variable score holds the number 10. console.log displays its value.',
      es: 'La variable score contiene el número 10. console.log muestra su valor.',
    },
    nextStep: {
      en: 'What if we do score = 20 and log it again? Predict the result.',
      es: '¿Qué pasa si hacemos score = 20 y lo mostramos de nuevo? Predice el resultado.',
    },
  },
];

export const firstLessonId = lessons[0]!.id;

export function getLesson(id: string, locale: ContentLocale) {
  const lesson = lessons.find((l) => l.id === id);
  if (!lesson) return undefined;
  return {
    id: lesson.id,
    version: lesson.version,
    locale,
    title: lesson.title[locale],
    objective: lesson.objective[locale],
    explanation: lesson.explanation[locale],
    example: lesson.example,
    exercise: {
      id: lesson.exercise.id,
      prompt: lesson.exercise.prompt[locale],
      choices: lesson.exercise.choices,
    },
  };
}

export function listLessons(locale: ContentLocale = 'en') {
  return lessons.map((lesson) => ({
    id: lesson.id,
    version: lesson.version,
    title: lesson.title[locale],
  }));
}

export function checkPrediction(
  id: string,
  locale: ContentLocale,
  version: number,
  choiceId: string,
) {
  const lesson = lessons.find((l) => l.id === id);
  if (!lesson) return { kind: 'missing' } as const;
  if (version !== lesson.version) return { kind: 'stale' } as const;
  if (!lesson.exercise.choices.some((choice) => choice.id === choiceId))
    return { kind: 'invalid-choice' } as const;
  return {
    kind: 'feedback',
    feedback: {
      correct: choiceId === lesson.exercise.correctChoice,
      explanation: lesson.feedback[locale],
      nextStep: lesson.nextStep[locale],
      provenance: 'practice-feedback',
    },
  } as const;
}
