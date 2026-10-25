import type { LessonData } from './index';

export const nextFoundations: LessonData[] = [
  {
    id: 'working-with-text',
    version: 1,
    title: { en: 'Working with text', es: 'Trabajar con texto' },
    objective: {
      en: 'Join strings and distinguish text from numbers.',
      es: 'Une cadenas y distingue texto de números.',
    },
    explanation: {
      en: [
        'A string is text enclosed in matching quotation marks. "3" is a string; 3 is a number.',
        'The + operator adds two numbers, but joins strings. "3" + "2" produces "32", not 5.',
        'You can join a variable and another string. Spaces must be included inside the quotes if you want them in the result.',
      ],
      es: [
        'Una cadena es texto entre comillas del mismo tipo. "3" es una cadena; 3 es un número.',
        'El operador + suma dos números, pero une cadenas. "3" + "2" produce "32", no 5.',
        'Puedes unir una variable con otra cadena. Incluye los espacios dentro de las comillas si quieres que aparezcan en el resultado.',
      ],
    },
    example: 'let name = "Ada";\nconsole.log("Hello, " + name);',
    coding: {
      prompt: {
        en: 'Change the name to Sam. Keep the greeting and display Hello, Sam.',
        es: 'Cambia el nombre a Sam. Conserva el saludo y muestra Hello, Sam.',
      },
      expectedOutput: ['Hello, Sam'],
    },
    exercise: {
      id: 'predict-greeting-v1',
      prompt: { en: 'What will this program display?', es: '¿Qué mostrará este programa?' },
      choices: [
        { id: 'greeting', label: 'Hello, Ada' },
        { id: 'variable', label: 'Hello, name' },
        { id: 'no-space', label: 'Hello,Ada' },
      ],
      correctChoice: 'greeting',
    },
    feedback: {
      en: 'name contains the string "Ada". The + operator joins it to "Hello, ", including the space after the comma.',
      es: 'name contiene la cadena "Ada". El operador + la une a "Hello, ", incluido el espacio después de la coma.',
    },
    nextStep: {
      en: 'Compare console.log(3 + 2) with console.log("3" + "2"). Why are the results different?',
      es: 'Compara console.log(3 + 2) con console.log("3" + "2"). ¿Por qué son distintos los resultados?',
    },
  },
  {
    id: 'comparing-values',
    version: 1,
    title: { en: 'Comparing values', es: 'Comparar valores' },
    objective: {
      en: 'Use comparisons to produce true or false.',
      es: 'Usa comparaciones para producir true o false.',
    },
    explanation: {
      en: [
        'A boolean has one of two values: true or false. These are JavaScript keywords, not quoted strings.',
        'The >= operator asks whether the left number is greater than or equal to the right number. The > operator excludes equality.',
        'Strict equality, ===, compares values without converting their types: 3 === 3 is true, while 3 === "3" is false. A single = assigns a value; it does not compare.',
      ],
      es: [
        'Un booleano tiene uno de dos valores: true o false. Son palabras de JavaScript, no cadenas entre comillas.',
        'El operador >= pregunta si el número de la izquierda es mayor o igual al de la derecha. El operador > excluye la igualdad.',
        'La igualdad estricta, ===, compara valores sin convertir sus tipos: 3 === 3 es true, pero 3 === "3" es false. Un solo = asigna un valor; no compara.',
      ],
    },
    example: 'let score = 10;\nconsole.log(score >= 10);',
    coding: {
      prompt: {
        en: 'Keep score at 10. Display score > 10, then score === 10, on separate lines.',
        es: 'Mantén score en 10. Muestra score > 10 y después score === 10, en líneas distintas.',
      },
      expectedOutput: ['false', 'true'],
    },
    exercise: {
      id: 'predict-comparison-v1',
      prompt: { en: 'What will this program display?', es: '¿Qué mostrará este programa?' },
      choices: [
        { id: 'true', label: 'true' },
        { id: 'false', label: 'false' },
        { id: 'ten', label: '10' },
      ],
      correctChoice: 'true',
    },
    feedback: {
      en: '10 is equal to 10, so score >= 10 evaluates to true. A comparison produces a boolean, not the original number.',
      es: '10 es igual a 10, por eso score >= 10 produce true. Una comparación produce un booleano, no el número original.',
    },
    nextStep: {
      en: 'Predict the comparison results for scores of 9, 10 and 11 before testing them.',
      es: 'Predice los resultados de las comparaciones con puntuaciones de 9, 10 y 11 antes de probarlas.',
    },
  },
  {
    id: 'making-decisions',
    version: 1,
    title: { en: 'Making decisions', es: 'Tomar decisiones' },
    objective: {
      en: 'Choose which code runs with if and else.',
      es: 'Elige qué código se ejecuta con if y else.',
    },
    explanation: {
      en: [
        'An if statement checks the condition inside parentheses. If it is true, JavaScript runs the code inside the following braces.',
        'An else block runs when that condition is false. In an if/else pair, only one branch runs.',
        'Indent the statements inside each block to make the branches easier to read. Test values below, at and above a boundary to check your decision.',
      ],
      es: [
        'Una sentencia if comprueba la condición entre paréntesis. Si es true, JavaScript ejecuta el código entre las llaves que siguen.',
        'El bloque else se ejecuta cuando esa condición es false. En un par if/else, solo se ejecuta una rama.',
        'Indenta las sentencias de cada bloque para facilitar la lectura. Prueba valores por debajo, en el límite y por encima para comprobar tu decisión.',
      ],
    },
    example:
      'let score = 8;\nif (score >= 10) {\n  console.log("Ready");\n} else {\n  console.log("Keep practicing");\n}',
    coding: {
      prompt: {
        en: 'Change only score to 10. Run the program and explain why it now displays Ready.',
        es: 'Cambia solo score a 10. Ejecuta el programa y explica por qué ahora muestra Ready.',
      },
      expectedOutput: ['Ready'],
    },
    exercise: {
      id: 'predict-branch-v1',
      prompt: {
        en: 'Which message will this program display?',
        es: '¿Qué mensaje mostrará este programa?',
      },
      choices: [
        { id: 'ready', label: 'Ready' },
        { id: 'practice', label: 'Keep practicing' },
        { id: 'both', label: 'Ready / Keep practicing' },
      ],
      correctChoice: 'practice',
    },
    feedback: {
      en: '8 >= 10 is false, so JavaScript skips the if block and runs the else block. It displays only Keep practicing.',
      es: '8 >= 10 es false, así que JavaScript omite el bloque if y ejecuta el bloque else. Solo muestra Keep practicing.',
    },
    nextStep: {
      en: 'Try scores of 9, 10 and 11. Which change would accidentally exclude a score of exactly 10?',
      es: 'Prueba puntuaciones de 9, 10 y 11. ¿Qué cambio excluiría por accidente una puntuación de exactamente 10?',
    },
  },
];
