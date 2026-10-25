import type { LessonData } from './index';

export const appliedFoundations: LessonData[] = [
  {
    id: 'building-a-basket-total',
    version: 1,
    title: { en: 'Build a basket total', es: 'Calcula el total de una cesta' },
    objective: {
      en: 'Combine arrays, objects, loops and functions to total a small shopping basket.',
      es: 'Combina arreglos, objetos, bucles y funciones para sumar una cesta de compras.',
    },
    explanation: {
      en: [
        'A small project starts with a contract. Our basket is an array of objects. Each object has priceCents and quantity, both non-negative whole numbers. The function returns a total in cents. Input validation is outside this first exercise.',
        'Using whole cents keeps these small calculations exact. For example, 250 means 2.50 currency units. Display formatting is a separate task; do not mix it into the calculation.',
        'Start total at zero inside the function. Visit each item, multiply its price by its quantity, and add the result to total. This pattern is called an accumulator: it remembers the result so far.',
        'An empty array performs zero repetitions and returns zero. Keeping total inside the function also prevents one basket from affecting the next. Test the empty basket, a single item, and several items.',
      ],
      es: [
        'Un proyecto pequeño empieza con un contrato. Nuestra cesta es un arreglo de objetos. Cada objeto tiene priceCents y quantity, ambos enteros no negativos. La función devuelve un total en centavos. Validar entradas queda fuera de este primer ejercicio.',
        'Usar centavos enteros mantiene exactos estos cálculos pequeños. Por ejemplo, 250 representa 2.50 unidades monetarias. El formato de presentación es otra tarea; no lo mezcles con el cálculo.',
        'Inicia total en cero dentro de la función. Visita cada producto, multiplica su precio por su cantidad y suma el resultado a total. Este patrón se llama acumulador: recuerda el resultado hasta el momento.',
        'Un arreglo vacío ejecuta cero repeticiones y devuelve cero. Mantener total dentro de la función evita que una cesta afecte a la siguiente. Prueba una cesta vacía, un producto y varios productos.',
      ],
    },
    example:
      'let basket = [{ priceCents: 250, quantity: 2 }, { priceCents: 100, quantity: 3 }];\nlet total = 0;\nfor (let i = 0; i < basket.length; i = i + 1) {\n  total = total + basket[i].priceCents * basket[i].quantity;\n}\nconsole.log(total);',
    coding: {
      prompt: {
        en: 'Turn the example into a function basketTotal(items) that returns the total. Log its result for [], then [{ priceCents: 250, quantity: 2 }], then the two-item basket from the example. Expected lines: 0, 500, 800. After checking those three lines, try quantity zero in a separate run.',
        es: 'Convierte el ejemplo en una función basketTotal(items) que devuelva el total. Muestra su resultado para [], luego [{ priceCents: 250, quantity: 2 }] y después la cesta de dos productos del ejemplo. Líneas esperadas: 0, 500, 800. Después de comprobar esas tres líneas, prueba cantidad cero en otra ejecución.',
      },
      expectedOutput: ['0', '500', '800'],
    },
    exercise: {
      id: 'predict-basket-v1',
      prompt: {
        en: 'What total in cents does the example display?',
        es: '¿Qué total en centavos muestra el ejemplo?',
      },
      choices: [
        { id: 'sum', label: '800' },
        { id: 'prices', label: '350' },
        { id: 'last', label: '300' },
      ],
      correctChoice: 'sum',
    },
    feedback: {
      en: 'The first item contributes 250 × 2 = 500 cents and the second contributes 100 × 3 = 300. Adding both gives 800.',
      es: 'El primer producto aporta 250 × 2 = 500 centavos y el segundo 100 × 3 = 300. Sumarlos da 800.',
    },
    nextStep: {
      en: 'Explain why total belongs inside the function. What input checks would you add before using this with untrusted data? Output matching checks these examples only, not every possible basket.',
      es: 'Explica por qué total debe estar dentro de la función. ¿Qué validaciones añadirías antes de usar datos no confiables? Comparar la salida comprueba estos ejemplos, no todas las cestas posibles.',
    },
  },
  {
    id: 'building-a-study-summary',
    version: 1,
    title: { en: 'Build a study summary', es: 'Crea un resumen de estudio' },
    objective: {
      en: 'Select records with a condition and summarize their values without changing the original data.',
      es: 'Selecciona registros con una condición y resume sus valores sin cambiar los datos originales.',
    },
    explanation: {
      en: [
        'Imagine a study journal where each session has minutes and completed. We want the total minutes from completed sessions only. Minutes are non-negative whole numbers; completed is a boolean.',
        'A loop visits every session. An if statement decides whether its minutes contribute to the total. Visiting a record does not mean counting it.',
        'Use completed === true to express the rule explicitly. A session marked false contributes nothing, even if its minutes field is positive.',
        'The function should read the records without changing them. Try an empty journal, unfinished sessions, and completed sessions with zero minutes. Explain your rule before writing the code, as you would in an interview.',
      ],
      es: [
        'Imagina un diario donde cada sesión tiene minutes y completed. Queremos sumar solo los minutos de sesiones terminadas. minutes es un entero no negativo; completed es un booleano.',
        'Un bucle visita cada sesión. Una condición if decide si sus minutos contribuyen al total. Visitar un registro no significa contarlo.',
        'Usa completed === true para expresar la regla de forma explícita. Una sesión marcada false no aporta nada, aunque su campo minutes sea positivo.',
        'La función debe leer los registros sin cambiarlos. Prueba un diario vacío, sesiones pendientes y sesiones terminadas con cero minutos. Explica tu regla antes de programar, como harías en una entrevista.',
      ],
    },
    example:
      'let sessions = [{ minutes: 15, completed: true }, { minutes: 20, completed: false }];\nlet total = 0;\nfor (let i = 0; i < sessions.length; i = i + 1) {\n  if (sessions[i].completed === true) {\n    total = total + sessions[i].minutes;\n  }\n}\nconsole.log(total);',
    coding: {
      prompt: {
        en: 'Write completedMinutes(sessions). Log results for [], then [{ minutes: 20, completed: false }], then [{ minutes: 15, completed: true }, { minutes: 20, completed: false }, { minutes: 10, completed: true }]. Expected lines: 0, 0, 25. Do not change the input records.',
        es: 'Escribe completedMinutes(sessions). Muestra los resultados para [], luego [{ minutes: 20, completed: false }] y después [{ minutes: 15, completed: true }, { minutes: 20, completed: false }, { minutes: 10, completed: true }]. Líneas esperadas: 0, 0, 25. No cambies los registros de entrada.',
      },
      expectedOutput: ['0', '0', '25'],
    },
    exercise: {
      id: 'predict-study-summary-v1',
      prompt: {
        en: 'How many minutes does the example count?',
        es: '¿Cuántos minutos cuenta el ejemplo?',
      },
      choices: [
        { id: 'completed', label: '15' },
        { id: 'all', label: '35' },
        { id: 'unfinished', label: '20' },
      ],
      correctChoice: 'completed',
    },
    feedback: {
      en: 'Only the first session is completed. The loop visits the second session too, but the condition prevents its 20 minutes from being added.',
      es: 'Solo la primera sesión está terminada. El bucle también visita la segunda, pero la condición evita sumar sus 20 minutos.',
    },
    nextStep: {
      en: 'Describe the input contract, one edge case, and why your function leaves the journal unchanged. Could you also count completed sessions using a second accumulator?',
      es: 'Describe el contrato de entrada, un caso límite y por qué tu función deja el diario intacto. ¿Podrías contar también las sesiones terminadas con otro acumulador?',
    },
  },
];
