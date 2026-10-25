import type { LessonData } from './index';

export const structuredFoundations: LessonData[] = [
  {
    id: 'repeating-with-loops',
    version: 1,
    title: { en: 'Repeating with loops', es: 'Repetir con bucles' },
    objective: {
      en: 'Repeat a task with a counter and a stopping condition.',
      es: 'Repite una tarea con un contador y una condición de parada.',
    },
    explanation: {
      en: [
        'A loop repeats a block. For example, a game can display each round number without writing a separate console.log for every round.',
        'A for loop has three parts inside parentheses: initialize a counter, check a condition before each repetition, and update the counter after each repetition. Semicolons separate these parts.',
        'In this example, round starts at 1. The <= operator means less than or equal to. After displaying round, round = round + 1 increases it by one. When round becomes 4, the condition is false and the loop stops.',
        'Check both the starting value and the boundary. Using < instead of <= excludes the boundary. A counter that never moves toward a false condition can create an infinite loop.',
      ],
      es: [
        'Un bucle repite un bloque. Por ejemplo, un juego puede mostrar el número de cada ronda sin escribir un console.log distinto para cada una.',
        'Un bucle for tiene tres partes entre paréntesis: iniciar un contador, comprobar una condición antes de cada repetición y actualizar el contador después. Los puntos y coma separan estas partes.',
        'En este ejemplo, round empieza en 1. El operador <= significa menor o igual. Después de mostrar round, round = round + 1 lo aumenta en uno. Cuando round llega a 4, la condición es false y el bucle termina.',
        'Comprueba el valor inicial y el límite. Usar < en lugar de <= excluye el límite. Si el contador nunca avanza hacia una condición falsa, puedes crear un bucle infinito.',
      ],
    },
    example: 'for (let round = 1; round <= 3; round = round + 1) {\n  console.log(round);\n}',
    coding: {
      prompt: {
        en: 'Change the stopping condition so the loop displays rounds 1 through 4, one per line.',
        es: 'Cambia la condición de parada para mostrar las rondas de 1 a 4, una por línea.',
      },
      expectedOutput: ['1', '2', '3', '4'],
    },
    exercise: {
      id: 'predict-loop-v1',
      prompt: {
        en: 'Which sequence will this program display, one number per line?',
        es: '¿Qué secuencia mostrará este programa, un número por línea?',
      },
      choices: [
        { id: 'three', label: '1, 2, 3' },
        { id: 'two', label: '1, 2' },
        { id: 'four', label: '1, 2, 3, 4' },
      ],
      correctChoice: 'three',
    },
    feedback: {
      en: 'The condition allows 1, 2 and 3. The counter then becomes 4, but 4 <= 3 is false, so 4 is never displayed.',
      es: 'La condición permite 1, 2 y 3. El contador después llega a 4, pero 4 <= 3 es false, así que 4 nunca se muestra.',
    },
    nextStep: {
      en: 'Predict what changes if round starts at 0. Then compare < 3 with <= 3. Explain how many times each version runs.',
      es: 'Predice qué cambia si round empieza en 0. Después compara < 3 con <= 3. Explica cuántas veces se ejecuta cada versión.',
    },
  },
  {
    id: 'writing-functions',
    version: 1,
    title: { en: 'Writing functions', es: 'Escribir funciones' },
    objective: {
      en: 'Name a reusable calculation with a parameter and return value.',
      es: 'Da nombre a un cálculo reutilizable con un parámetro y un valor de retorno.',
    },
    explanation: {
      en: [
        'A function groups instructions under a name so you can reuse them. Defining it does not run its body; calling its name with parentheses does.',
        'The parameter points is a local name for the input. In double(3), the argument 3 becomes the value of points for that call. The * operator multiplies numbers.',
        'return sends a value back to the caller and ends that function call. console.log displays a value instead. Returning 6 does not display it until you pass it to console.log.',
        'Separate calculation from display so the same function can be used by a game, a report or another calculation. Each call can receive a different input.',
      ],
      es: [
        'Una función agrupa instrucciones bajo un nombre para reutilizarlas. Definirla no ejecuta su cuerpo; llamarla por su nombre con paréntesis sí.',
        'El parámetro points es un nombre local para la entrada. En double(3), el argumento 3 se convierte en el valor de points para esa llamada. El operador * multiplica números.',
        'return devuelve un valor a quien llamó la función y termina esa llamada. En cambio, console.log muestra un valor. Devolver 6 no lo muestra hasta pasarlo a console.log.',
        'Separa el cálculo de la presentación para usar la misma función en un juego, un informe u otro cálculo. Cada llamada puede recibir una entrada diferente.',
      ],
    },
    example: 'function double(points) {\n  return points * 2;\n}\nconsole.log(double(3));',
    coding: {
      prompt: {
        en: 'Keep the double function. Call it with 4 and then 5, displaying each returned value on its own line.',
        es: 'Conserva la función double. Llámala con 4 y después con 5, mostrando cada valor devuelto en su propia línea.',
      },
      expectedOutput: ['8', '10'],
    },
    exercise: {
      id: 'predict-function-v1',
      prompt: { en: 'What will this program display?', es: '¿Qué mostrará este programa?' },
      choices: [
        { id: 'six', label: '6' },
        { id: 'three', label: '3' },
        { id: 'undefined', label: 'undefined' },
      ],
      correctChoice: 'six',
    },
    feedback: {
      en: 'double(3) supplies 3 as points. The function returns 3 * 2, which is 6. console.log displays that returned value.',
      es: 'double(3) proporciona 3 como points. La función devuelve 3 * 2, que es 6. console.log muestra ese valor devuelto.',
    },
    nextStep: {
      en: 'Predict double(0) and double(-2). Explain the difference between returning a value and displaying one.',
      es: 'Predice double(0) y double(-2). Explica la diferencia entre devolver un valor y mostrarlo.',
    },
  },
  {
    id: 'collecting-with-arrays',
    version: 1,
    title: { en: 'Collecting values in arrays', es: 'Agrupar valores en arreglos' },
    objective: {
      en: 'Read and update an ordered collection using indexes.',
      es: 'Lee y actualiza una colección ordenada mediante índices.',
    },
    explanation: {
      en: [
        'An array holds an ordered collection, such as scores from several rounds. Square brackets create the array and commas separate its elements.',
        'Indexes start at 0: scores[0] is the first element, scores[1] is the second, and scores[2] is the third. The index is a position, not the value stored there.',
        'scores.length gives the number of elements. For an array with three elements, the final index is 2, not 3. Reading scores[3] here produces undefined.',
        'Assigning scores[1] = 8 replaces the second element without changing this array’s length. You can combine indexes and a loop to visit elements; the condition should stay below length.',
      ],
      es: [
        'Un arreglo contiene una colección ordenada, como las puntuaciones de varias rondas. Los corchetes crean el arreglo y las comas separan sus elementos.',
        'Los índices empiezan en 0: scores[0] es el primer elemento, scores[1] el segundo y scores[2] el tercero. El índice es una posición, no el valor guardado allí.',
        'scores.length indica la cantidad de elementos. En un arreglo con tres elementos, el último índice es 2, no 3. Leer scores[3] aquí produce undefined.',
        'Asignar scores[1] = 8 reemplaza el segundo elemento sin cambiar la longitud de este arreglo. Puedes combinar índices y un bucle para recorrerlo; la condición debe mantenerse por debajo de length.',
      ],
    },
    example: 'let scores = [2, 4, 6];\nconsole.log(scores[1]);',
    coding: {
      prompt: {
        en: 'Replace the second score with 8. Display scores.length, then scores[1], on separate lines.',
        es: 'Reemplaza la segunda puntuación por 8. Muestra scores.length y después scores[1], en líneas distintas.',
      },
      expectedOutput: ['3', '8'],
    },
    exercise: {
      id: 'predict-array-v1',
      prompt: { en: 'What will this program display?', es: '¿Qué mostrará este programa?' },
      choices: [
        { id: 'four', label: '4' },
        { id: 'two', label: '2' },
        { id: 'one', label: '1' },
      ],
      correctChoice: 'four',
    },
    feedback: {
      en: 'Index 1 selects the second element, 4. Index 0 would select 2. The index tells JavaScript which position to read.',
      es: 'El índice 1 selecciona el segundo elemento, 4. El índice 0 seleccionaría 2. El índice indica a JavaScript qué posición leer.',
    },
    nextStep: {
      en: 'Use a for loop starting at index 0 with index < scores.length to display every score. Why would <= read one position too far?',
      es: 'Usa un bucle for que empiece en el índice 0 con index < scores.length para mostrar cada puntuación. ¿Por qué <= leería una posición de más?',
    },
  },
  {
    id: 'describing-with-objects',
    version: 1,
    title: { en: 'Describing things with objects', es: 'Describir cosas con objetos' },
    objective: {
      en: 'Group related values with named properties.',
      es: 'Agrupa valores relacionados con propiedades con nombre.',
    },
    explanation: {
      en: [
        'An object groups information about one thing. A player can have a name and a score: these values belong together but describe different properties.',
        'An object literal uses braces. Each property has a name, a colon and a value; commas separate properties. This is different from a block of instructions inside an if or function.',
        'Dot notation reads a named property: player.name reads the name. player.score = 20 updates only the score and preserves the name.',
        'An array is useful for an ordered list; an object is useful for named details. Reading a missing property produces undefined. In these introductory exercises, display individual properties rather than the whole object.',
      ],
      es: [
        'Un objeto agrupa información sobre una cosa. Un jugador puede tener un nombre y una puntuación: estos valores van juntos, pero describen propiedades diferentes.',
        'Un literal de objeto usa llaves. Cada propiedad tiene un nombre, dos puntos y un valor; las comas separan propiedades. Esto es distinto de un bloque de instrucciones dentro de un if o una función.',
        'La notación de punto lee una propiedad con nombre: player.name lee el nombre. player.score = 20 actualiza solo la puntuación y conserva el nombre.',
        'Un arreglo sirve para una lista ordenada; un objeto sirve para detalles con nombre. Leer una propiedad que no existe produce undefined. En estos ejercicios iniciales, muestra propiedades individuales en lugar del objeto completo.',
      ],
    },
    example: 'let player = { name: "Ada", score: 10 };\nconsole.log(player.name);',
    coding: {
      prompt: {
        en: 'Update player.score to 20. Display player.name, then player.score, on separate lines.',
        es: 'Actualiza player.score a 20. Muestra player.name y después player.score, en líneas distintas.',
      },
      expectedOutput: ['Ada', '20'],
    },
    exercise: {
      id: 'predict-object-v1',
      prompt: { en: 'What will this program display?', es: '¿Qué mostrará este programa?' },
      choices: [
        { id: 'ada', label: 'Ada' },
        { id: 'name', label: 'name' },
        { id: 'ten', label: '10' },
      ],
      correctChoice: 'ada',
    },
    feedback: {
      en: 'player.name reads the value stored in the name property: "Ada". It does not display the property name or the score.',
      es: 'player.name lee el valor guardado en la propiedad name: "Ada". No muestra el nombre de la propiedad ni la puntuación.',
    },
    nextStep: {
      en: 'Write a function that receives a player and returns that player’s score. How would you store several players in an ordered collection?',
      es: 'Escribe una función que reciba un jugador y devuelva su puntuación. ¿Cómo guardarías varios jugadores en una colección ordenada?',
    },
  },
];
