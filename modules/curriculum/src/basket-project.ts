import type { LessonData } from './index';

export const basketProject: LessonData = {
  id: 'project-basket-total',
  version: 1,
  title: { en: 'Project: basket calculator', es: 'Proyecto: calculadora de cesta' },
  objective: {
    en: 'Build, test and explain a reusable basket calculator.',
    es: 'Construye, prueba y explica una calculadora de cesta reutilizable.',
  },
  explanation: {
    en: [
      'Use what you learned about functions, arrays, objects and loops. Work through the milestones, run the checks, then explain your decisions.',
    ],
    es: [
      'Usa lo aprendido sobre funciones, arreglos, objetos y bucles. Sigue los pasos, ejecuta las pruebas y explica tus decisiones.',
    ],
  },
  example: 'function basketTotal(items) {\n  // Return the total in cents.\n  return 0;\n}',
  coding: {
    prompt: {
      en: 'Implement basketTotal(items). Return a number; console output is not used for these checks. Each check calls your function with a different basket.',
      es: 'Implementa basketTotal(items). Devuelve un número; estas pruebas no usan la salida de consola. Cada prueba llama a tu función con otra cesta.',
    },
    expectedOutput: [],
    checks: [
      {
        label: { en: 'Empty basket', es: 'Cesta vacía' },
        expression: 'basketTotal([])',
        expected: 0,
      },
      {
        label: { en: 'One item with quantity', es: 'Un producto con cantidad' },
        expression: 'basketTotal([{priceCents:250,quantity:2}])',
        expected: 500,
      },
      {
        label: { en: 'Multiple items', es: 'Varios productos' },
        expression: 'basketTotal([{priceCents:250,quantity:2},{priceCents:100,quantity:3}])',
        expected: 800,
      },
      {
        label: { en: 'Zero quantity', es: 'Cantidad cero' },
        expression: 'basketTotal([{priceCents:900,quantity:0}])',
        expected: 0,
      },
      {
        label: { en: 'Free item', es: 'Producto gratuito' },
        expression: 'basketTotal([{priceCents:0,quantity:4},{priceCents:75,quantity:1}])',
        expected: 75,
      },
      {
        label: { en: 'Independent repeated calls', es: 'Llamadas independientes' },
        expression:
          '(() => { basketTotal([{priceCents:10,quantity:2}]); return basketTotal([{priceCents:3,quantity:1}]); })()',
        expected: 3,
      },
      {
        label: { en: 'Input records remain unchanged', es: 'Los registros no cambian' },
        expression:
          '(() => { const item = {priceCents:120,quantity:2}; const items = [item]; basketTotal(items); return items.length === 1 && items[0] === item && item.priceCents === 120 && item.quantity === 2 ? 1 : 0; })()',
        expected: 1,
      },
    ],
  },
  project: {
    requirements: {
      en: [
        'Accept an array of records with priceCents and quantity. Both fields are non-negative whole numbers, and totals stay within JavaScript’s safe integer range.',
        'Return the total in cents. An empty basket returns zero. Do not mutate the array or its records.',
        'Invalid input handling, tax, discounts, currency formatting and browser interfaces are outside this project.',
      ],
      es: [
        'Acepta un arreglo de registros con priceCents y quantity. Ambos campos son enteros no negativos, y los totales están dentro del rango de enteros seguros de JavaScript.',
        'Devuelve el total en centavos. Una cesta vacía devuelve cero. No modifiques el arreglo ni sus registros.',
        'Validación de entradas incorrectas, impuestos, descuentos, formato monetario e interfaces de navegador quedan fuera de este proyecto.',
      ],
    },
    milestones: {
      en: [
        'Define the contract: describe an input and calculate its result by hand.',
        'Implement the accumulator: begin at zero and add price × quantity for each item.',
        'Run checks: investigate a failure before changing the code. Add your own examples with console.log.',
        'Review your work: save an attempt, then explain the edge cases and tradeoffs in your notes.',
      ],
      es: [
        'Define el contrato: describe una entrada y calcula su resultado a mano.',
        'Implementa el acumulador: empieza en cero y suma precio × cantidad por producto.',
        'Ejecuta las pruebas: investiga un fallo antes de cambiar el código. Añade ejemplos propios con console.log.',
        'Revisa tu trabajo: guarda un intento y explica los casos límite y decisiones en tus notas.',
      ],
    },
    reflection: {
      en: [
        'Clarify: what inputs do you accept, and what would you ask before supporting discounts?',
        'Explain: walk through a two-item basket, tracking the accumulator after each iteration.',
        'Test: describe a failure you found and the smallest input that revealed it.',
        'Discuss: why use cents? How does the work grow when the number of items doubles?',
        'Reflect: what would you improve next? These are self-review prompts, not an automated hiring score.',
      ],
      es: [
        'Aclara: ¿qué entradas aceptas y qué preguntarías antes de admitir descuentos?',
        'Explica: recorre una cesta de dos productos e indica el acumulador después de cada iteración.',
        'Prueba: describe un fallo encontrado y la entrada más pequeña que lo reveló.',
        'Comenta: ¿por qué usar centavos? ¿Cómo crece el trabajo si se duplica el número de productos?',
        'Reflexiona: ¿qué mejorarías después? Son preguntas de autoevaluación, no una puntuación automática de contratación.',
      ],
    },
  },
  exercise: {
    id: 'project-basket-predict-v1',
    prompt: {
      en: 'What should an empty basket return?',
      es: '¿Qué debe devolver una cesta vacía?',
    },
    choices: [
      { id: 'zero', label: '0' },
      { id: 'one', label: '1' },
    ],
    correctChoice: 'zero',
  },
  feedback: {
    en: 'With no items, nothing is added to the initial total of zero.',
    es: 'Sin productos, no se suma nada al total inicial de cero.',
  },
  nextStep: {
    en: 'Explain your contract before writing the loop.',
    es: 'Explica tu contrato antes de escribir el bucle.',
  },
};
