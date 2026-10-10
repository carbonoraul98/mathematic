const { connectionPromise, Activity, Question, Group, Student } = require('./models/database');

const practicesData = [
  {
    title: 'Actividad de Prueba', theme: 'General', type: 'Examen',
    questions: [
      { q: "¿Prueba 1: 1 + 1?", a: "2", b: "3", c: "4", correct: "2" },
      { q: "¿Prueba 2: de qué color es el caballo blanco de San Martín?", a: "Blanco", b: "Negro", c: "Rojo", correct: "Blanco" }
    ]
  },
  {
    title: 'Suma', theme: 'Grado 4',
    questions: [
      { q: "¿Cuánto es 15 + 27?", a: "42", b: "32", c: "45", correct: "42" },
      { q: "¿Si tengo 5 manzanas y me regalan 8, cuántas tengo?", a: "11", b: "13", c: "15", correct: "13" },
      { q: "¿Cuánto es 120 + 350?", a: "470", b: "450", c: "570", correct: "470" }
    ]
  },
  {
    title: 'Resta', theme: 'Grado 4',
    questions: [
      { q: "¿Cuánto es 50 - 18?", a: "22", b: "32", c: "42", correct: "32" },
      { q: "¿Si tenía 20 galletas y comí 7, cuántas me quedan?", a: "11", b: "12", c: "13", correct: "13" },
      { q: "¿Cuánto es 500 - 150?", a: "250", b: "350", c: "450", correct: "350" }
    ]
  },
  {
    title: 'Multiplicación', theme: 'Grado 4',
    questions: [
      { q: "¿Cuánto es 8 x 7?", a: "54", b: "56", c: "64", correct: "56" },
      { q: "¿Cuánto es 12 x 5?", a: "50", b: "60", c: "70", correct: "60" },
      { q: "Un paquete tiene 6 dulces. ¿Cuántos dulces hay en 4 paquetes?", a: "20", b: "24", c: "30", correct: "24" }
    ]
  },
  {
    title: 'División', theme: 'Grado 5',
    questions: [
      { q: "¿Cuánto es 36 ÷ 6?", a: "5", b: "6", c: "7", correct: "6" },
      { q: "¿Cuánto es 100 ÷ 4?", a: "20", b: "25", c: "30", correct: "25" },
      { q: "Tengo 24 lápices para repartir entre 3 amigos. ¿Cuántos le tocan a cada uno?", a: "6", b: "8", c: "9", correct: "8" }
    ]
  },
  {
    title: 'Fracciones I', theme: 'Grado 5',
    questions: [
      { 
        q: "Usa los modelos para completar la expresión con fracciones equivalentes. Las piezas de color representan partes del todo: 1/2 = ? / 6 [grafico:pies:2,1,#F59E0B|6,3,#3B82F6:1/2 = ?/6]", 
        a: "3", b: "2", c: "4", correct: "3" 
      },
      { 
        q: "Observa los modelos circulares: ¿Cuál es el numerador faltante en la equivalencia 1/3 = ? / 6? [grafico:pies:3,1,#10B981|6,2,#F97316:1/3 = ?/6]", 
        a: "2", b: "3", c: "1", correct: "2" 
      },
      { 
        q: "¿Son equivalentes las dos fracciones representadas en los modelos circulares? [grafico:pies:4,2,#8B5CF6|8,4,#06B6D4:2/4 = 4/8]", 
        a: "Sí, representan la misma parte del círculo", b: "No, 4/8 es más grande", c: "No, 2/4 es más grande", correct: "Sí, representan la misma parte del círculo" 
      },
      { 
        q: "Completa el denominador equivalente usando los modelos: 3/4 = 6 / ? [grafico:pies:4,3,#EAB308|8,6,#10B981:3/4 = 6/?]", 
        a: "8", b: "6", c: "10", correct: "8" 
      },
      { 
        q: "Observa las piezas de color: ¿Qué fracción del segundo modelo equivale a 2/3? [grafico:pies:3,2,#3B82F6|6,4,#EC4899:2/3 = 4/6]", 
        a: "4/6", b: "3/6", c: "5/6", correct: "4/6" 
      }
    ]
  },
  {
    title: 'Fracciones II', theme: 'Grado 5',
    questions: [
      { 
        q: "¿La fracción 1/4 es equivalente a la fracción 1/8? Observa las dos rectas numéricas. [grafico:dual_lines:4,1,#10B981|8,1,#D946EF]", 
        a: "No, no son equivalentes porque no se alinean en la misma posición", b: "Sí, son equivalentes porque ambas tienen numerador 1", c: "Sí, ambas están a la misma distancia de cero", correct: "No, no son equivalentes porque no se alinean en la misma posición" 
      },
      { 
        q: "Observa las dos rectas numéricas: ¿La fracción 1/2 es equivalente a la fracción 2/4? [grafico:dual_lines:2,1,#3B82F6|4,2,#10B981]", 
        a: "Sí, son equivalentes porque coinciden exactamente en la misma ubicación", b: "No, 2/4 está más hacia la derecha", c: "No, 1/2 representa un valor mayor", correct: "Sí, son equivalentes porque coinciden exactamente en la misma ubicación" 
      },
      { 
        q: "Representa 1/4 en la recta numérica dividida en doceavos. ¿A qué fracción corresponde 1/4? [grafico:single_line:12:3:#3B82F6]", 
        a: "3/12", b: "4/12", c: "2/12", correct: "3/12" 
      },
      { 
        q: "Observa la recta numérica en octavos: ¿Qué fracción marcada equivale a 1/2? [grafico:dual_lines:2,1,#F59E0B|8,4,#8B5CF6]", 
        a: "4/8", b: "2/8", c: "6/8", correct: "4/8" 
      },
      { 
        q: "Ubica 1/3 en una recta numérica graduada en doceavos. ¿Cuál es su fracción equivalente? [grafico:single_line:12:4:#10B981]", 
        a: "4/12", b: "3/12", c: "6/12", correct: "4/12" 
      }
    ]
  },
  {
    title: 'Multiplicación II', theme: 'Grado 4',
    questions: [
      { q: 'Multiplica los dos factores de dos cifras: 12 × 44 [grafico:vertical_mult:12:44]', a: '528', b: '488', c: '548', correct: '528' },
      { q: 'Calcula el producto en columna: 25 × 36 [grafico:vertical_mult:25:36]', a: '900', b: '850', c: '925', correct: '900' },
      { q: 'Resuelve la multiplicación en columna: 48 × 15 [grafico:vertical_mult:48:15]', a: '720', b: '680', c: '740', correct: '720' },
      { q: 'Multiplica: 64 × 23 [grafico:vertical_mult:64:23]', a: '1472', b: '1382', c: '1512', correct: '1472' },
      { q: 'Resuelve la operación: 38 × 42 [grafico:vertical_mult:38:42]', a: '1596', b: '1546', c: '1626', correct: '1596' }
    ]
  },
  {
    title: 'Multiplicación III', theme: 'Grado 5',
    questions: [
      { q: 'Multiplica el número de tres cifras por dos cifras: 245 × 32 [grafico:vertical_mult:245:32]', a: '7840', b: '7350', c: '7940', correct: '7840' },
      { q: 'Calcula el producto: 418 × 16 [grafico:vertical_mult:418:16]', a: '6688', b: '6588', c: '6788', correct: '6688' },
      { q: 'Multiplica el número de cuatro cifras por dos cifras: 1250 × 24 [grafico:vertical_mult:1250:24]', a: '30000', b: '28500', c: '32000', correct: '30000' },
      { q: 'Calcula el resultado en columna: 3420 × 15 [grafico:vertical_mult:3420:15]', a: '51300', b: '49800', c: '52400', correct: '51300' },
      { q: 'Multiplica: 2105 × 43 [grafico:vertical_mult:2105:43]', a: '90515', b: '89415', c: '91615', correct: '90515' }
    ]
  },
  {
    title: 'División II', theme: 'Grado 5',
    questions: [
      { q: 'Resuelve la división: 456 ÷ 12 [grafico:vertical_div:456:12]', a: '38', b: '34', c: '42', correct: '38' },
      { q: 'Calcula el cociente exacto: 720 ÷ 24 [grafico:vertical_div:720:24]', a: '30', b: '28', c: '35', correct: '30' },
      { q: 'Resuelve la división: 585 ÷ 15 [grafico:vertical_div:585:15]', a: '39', b: '35', c: '41', correct: '39' },
      { q: 'Calcula el cociente: 896 ÷ 28 [grafico:vertical_div:896:28]', a: '32', b: '28', c: '34', correct: '32' },
      { q: 'Resuelve: 960 ÷ 32 [grafico:vertical_div:960:32]', a: '30', b: '32', c: '28', correct: '30' }
    ]
  },
  {
    title: 'División III', theme: 'Grado 6',
    questions: [
      { q: 'Calcula la división de cuatro cifras: 1560 ÷ 24 [grafico:vertical_div:1560:24]', a: '65', b: '60', c: '70', correct: '65' },
      { q: 'Resuelve: 3840 ÷ 32 [grafico:vertical_div:3840:32]', a: '120', b: '115', c: '125', correct: '120' },
      { q: 'Calcula el cociente: 4250 ÷ 25 [grafico:vertical_div:4250:25]', a: '170', b: '165', c: '175', correct: '170' },
      { q: 'Resuelve la división: 2688 ÷ 42 [grafico:vertical_div:2688:42]', a: '64', b: '58', c: '68', correct: '64' },
      { q: 'Calcula el resultado: 5670 ÷ 54 [grafico:vertical_div:5670:54]', a: '105', b: '102', c: '110', correct: '105' }
    ]
  },
  {
    title: 'Plano Cartesiano I', theme: 'Geometría',
    questions: [
      { q: '¿Qué forma está en las coordenadas (10, 6)? [grafico:plane:heart,6,10,#10B981|star,5,5,#818CF8|circle,9,5,#FBBF24|pentagon,10,6,#38BDF8]', a: 'Pentágono azul', b: 'Corazón verde', c: 'Estrella lila', correct: 'Pentágono azul' },
      { q: '¿Qué figura se ubica en las coordenadas (5, 5)? [grafico:plane:heart,6,10,#10B981|star,5,5,#818CF8|circle,9,5,#FBBF24|pentagon,10,6,#38BDF8]', a: 'Estrella lila', b: 'Círculo amarillo', c: 'Pentágono azul', correct: 'Estrella lila' },
      { q: 'Observa el plano: ¿Qué forma está en las coordenadas (6, 10)? [grafico:plane:heart,6,10,#10B981|star,5,5,#818CF8|circle,9,5,#FBBF24|pentagon,10,6,#38BDF8]', a: 'Corazón verde', b: 'Círculo amarillo', c: 'Estrella lila', correct: 'Corazón verde' },
      { q: '¿Qué figura se encuentra en las coordenadas (9, 5)? [grafico:plane:heart,6,10,#10B981|star,5,5,#818CF8|circle,9,5,#FBBF24|pentagon,10,6,#38BDF8]', a: 'Círculo amarillo', b: 'Pentágono azul', c: 'Corazón verde', correct: 'Círculo amarillo' },
      { q: '¿Qué objeto se encuentra en el punto (3, 8)? [grafico:plane:triangle,3,8,#EF4444|diamond,7,2,#8B5CF6|circle,2,3,#F59E0B|star,8,9,#10B981]', a: 'Triángulo rojo', b: 'Diamante morado', c: 'Estrella verde', correct: 'Triángulo rojo' }
    ]
  },
  {
    title: 'Plano Cartesiano II', theme: 'Geometría',
    questions: [
      { q: '¿En qué coordenadas (x, y) se encuentra el corazón verde? [grafico:plane:heart,6,10,#10B981|star,5,5,#818CF8|circle,9,5,#FBBF24|pentagon,10,6,#38BDF8]', a: '(6, 10)', b: '(10, 6)', c: '(6, 6)', correct: '(6, 10)' },
      { q: '¿Cuáles son las coordenadas del pentágono azul? [grafico:plane:heart,6,10,#10B981|star,5,5,#818CF8|circle,9,5,#FBBF24|pentagon,10,6,#38BDF8]', a: '(10, 6)', b: '(6, 10)', c: '(10, 10)', correct: '(10, 6)' },
      { q: '¿En qué par ordenado (x, y) está ubicado el círculo amarillo? [grafico:plane:heart,6,10,#10B981|star,5,5,#818CF8|circle,9,5,#FBBF24|pentagon,10,6,#38BDF8]', a: '(9, 5)', b: '(5, 9)', c: '(9, 9)', correct: '(9, 5)' },
      { q: 'Identifica las coordenadas del diamante morado: [grafico:plane:triangle,3,8,#EF4444|diamond,7,2,#8B5CF6|circle,2,3,#F59E0B|star,8,9,#10B981]', a: '(7, 2)', b: '(2, 7)', c: '(7, 7)', correct: '(7, 2)' },
      { q: '¿En qué coordenadas se ubica la estrella verde? [grafico:plane:triangle,3,8,#EF4444|diamond,7,2,#8B5CF6|circle,2,3,#F59E0B|star,8,9,#10B981]', a: '(8, 9)', b: '(9, 8)', c: '(8, 8)', correct: '(8, 9)' }
    ]
  },
  {
    title: 'Estadística I', theme: 'Grado 5',
    questions: [
      { q: 'Observa el gráfico de barras: ¿Cuál fue el deporte más elegido por los estudiantes? [grafico:bar_chart:Fútbol,25,#3B82F6|Básquet,15,#F59E0B|Natación,20,#10B981|Vóley,10,#EC4899:Deportes Favoritos]', a: 'Fútbol (25 estudiantes)', b: 'Natación (20 estudiantes)', c: 'Básquet (15 estudiantes)', correct: 'Fútbol (25 estudiantes)' },
      { q: '¿Cuántos estudiantes en total eligieron entre Fútbol y Básquet? [grafico:bar_chart:Fútbol,25,#3B82F6|Básquet,15,#F59E0B|Natación,20,#10B981|Vóley,10,#EC4899:Deportes Favoritos]', a: '40 estudiantes', b: '35 estudiantes', c: '50 estudiantes', correct: '40 estudiantes' },
      { q: '¿Cuál fue el día de mayor venta de libros según el gráfico? [grafico:bar_chart:Lunes,12,#8B5CF6|Martes,18,#06B6D4|Miércoles,8,#F59E0B|Jueves,22,#10B981|Viernes,16,#EC4899:Libros Vendidos en la Semana]', a: 'Jueves (22 libros)', b: 'Martes (18 libros)', c: 'Viernes (16 libros)', correct: 'Jueves (22 libros)' },
      { q: '¿Cuántos libros más se vendieron el Jueves que el Miércoles? [grafico:bar_chart:Lunes,12,#8B5CF6|Martes,18,#06B6D4|Miércoles,8,#F59E0B|Jueves,22,#10B981|Viernes,16,#EC4899:Libros Vendidos en la Semana]', a: '14 libros', b: '12 libros', c: '10 libros', correct: '14 libros' },
      { q: '¿Cuál fue la fruta menos elegida por los niños? [grafico:bar_chart:Manzana,30,#EF4444|Banana,25,#FBBF24|Fresa,18,#F43F5E|Uva,12,#8B5CF6:Frutas Preferidas]', a: 'Uva (12 votos)', b: 'Fresa (18 votos)', c: 'Banana (25 votos)', correct: 'Uva (12 votos)' }
    ]
  },
  {
    title: 'Estadística II', theme: 'Grado 5',
    questions: [
      { q: 'Calcula la MEDIA (promedio) de las siguientes calificaciones: 8, 9, 7, 10, 6', a: '8', b: '7.5', c: '9', correct: '8' },
      { q: 'En el conjunto de datos [4, 7, 7, 8, 9, 7, 10], ¿cuál es la MODA?', a: '7 (el que más se repite)', b: '8', c: '9', correct: '7 (el que más se repite)' },
      { q: 'Para los datos ordenados [3, 5, 6, 8, 9, 12, 14], ¿cuál es la MEDIANA (dato central)?', a: '8', b: '6', c: '9', correct: '8' },
      { q: 'Un atleta corrió 4 km el lunes, 6 km el martes y 5 km el miércoles. ¿Cuál fue su promedio de km diarios?', a: '5 km', b: '4.5 km', c: '6 km', correct: '5 km' },
      { q: '¿Cuál es la mediana del grupo [2, 4, 6, 8, 10]?', a: '6', b: '5', c: '7', correct: '6' }
    ]
  },
  {
    title: 'Álgebra Básica', theme: 'Grado 5',
    questions: [
      { q: 'Calcula el valor numérico de la expresión cuando x = 4: [grafico:algebra:3x + 5:x = 4]', a: '17', b: '12', c: '19', correct: '17' },
      { q: 'Si n = 6, ¿cuál es el resultado de la expresión: [grafico:algebra:2n - 3:n = 6]', a: '9', b: '12', c: '15', correct: '9' },
      { q: 'Resuelve la ecuación para hallar el valor de x: [grafico:algebra:x + 18 = 45:Halla x]', a: '27', b: '25', c: '33', correct: '27' },
      { q: '¿Cuál es el valor de la incógnita \'m\' en la ecuación: [grafico:algebra:4m = 36:Halla m]', a: '9', b: '8', c: '7', correct: '9' },
      { q: '¿Qué expresión algebraica representa: \'El triple de un número aumentado en 7\'?', a: '3x + 7', b: 'x + 21', c: '3(x - 7)', correct: '3x + 7' }
    ]
  },
  {
    title: 'Decimales', theme: 'Grado 5',
    questions: [
      { q: "¿Cuánto es 0.5 + 0.5?", a: "0.10", b: "1.0", c: "0.25", correct: "1.0" },
      { q: "¿Cuál es mayor?", a: "0.09", b: "0.1", c: "0.05", correct: "0.1" },
      { q: "¿Cuánto es 1.5 - 0.5?", a: "0.5", b: "1.0", c: "1.5", correct: "1.0" }
    ]
  },
  {
    title: 'Geometría', theme: 'Grado 6',
    questions: [
      { q: "¿Cuántos lados tiene un hexágono?", a: "5", b: "6", c: "7", correct: "6" },
      { q: "¿Cuál es el área de un cuadrado de lado 5cm?", a: "20cm", b: "25cm", c: "10cm", correct: "25cm" },
      { q: "¿Cuánto miden los ángulos internos de un triángulo?", a: "90°", b: "180°", c: "360°", correct: "180°" }
    ]
  },
  {
    title: 'Álgebra', theme: 'Grado 6',
    questions: [
      { q: "Si x + 5 = 12, ¿cuánto vale x?", a: "6", b: "7", c: "8", correct: "7" },
      { q: "¿Cuánto es 2x si x=4?", a: "6", b: "8", c: "16", correct: "8" },
      { q: "Si 3y = 15, ¿cuánto vale y?", a: "4", b: "5", c: "6", correct: "5" }
    ]
  },
  {
    title: 'Potencias', theme: 'Grado 6',
    questions: [
      { q: "¿Cuánto es 3 al cuadrado (3²)?", a: "6", b: "9", c: "12", correct: "9" },
      { q: "¿Cuánto es 2 al cubo (2³)?", a: "6", b: "8", c: "16", correct: "8" },
      { q: "¿Cualquier número elevado a la 0 es igual a...?", a: "0", b: "1", c: "El mismo número", correct: "1" }
    ]
  },
  {
    title: 'Ecuaciones', theme: 'Grado 6', type: 'Práctica',
    questions: [
      { q: "Resuelve: 2x + 4 = 10", a: "2", b: "3", c: "4", correct: "3" },
      { q: "Resuelve: x/2 = 5", a: "2.5", b: "5", c: "10", correct: "10" },
      { q: "Resuelve: 3x - 1 = 8", a: "2", b: "3", c: "4", correct: "3" }
    ]
  },
  {
    title: 'Evaluación General de Aritmética', theme: 'Matemáticas Básicas', type: 'Examen',
    questions: [
      { q: "¿Cuál es el resultado de 15 x 4?", a: "50", b: "60", c: "75", correct: "60" },
      { q: "¿Cuánto es 144 ÷ 12?", a: "10", b: "12", c: "14", correct: "12" },
      { q: "Si Juan tiene 45 manzanas y reparte a 5 amigos por igual, ¿cuántas le tocan a cada uno?", a: "8", b: "9", c: "10", correct: "9" },
      { q: "¿Cuánto es 3/4 + 1/4?", a: "1", b: "2/4", c: "1.5", correct: "1" },
      { q: "¿Cuál es el doble de 85?", a: "160", b: "170", c: "180", correct: "170" }
    ]
  },
  {
    title: 'Test Rápido: Geometría Básica', theme: 'Geometría', type: 'Examen',
    questions: [
      { q: "¿Cuántos lados tiene un hexágono?", a: "5", b: "6", c: "7", correct: "6" },
      { q: "¿Cuál es el área de un cuadrado de lado 4cm?", a: "8cm²", b: "12cm²", c: "16cm²", correct: "16cm²" },
      { q: "¿Cuánto suman los ángulos internos de un triángulo?", a: "90°", b: "180°", c: "360°", correct: "180°" }
    ]
  }
];

async function seedPractices() {
  try {
    const { connectionPromise, Activity, Question, Group, Student } = require('./models/database');
    await connectionPromise;

    // Check if practices exist
    const count = await Activity.countDocuments({ type: 'Práctica' });
    
    if (count === 0) {
      console.log('🌱 Seeding Practice Modules...');
      
      for (const p of practicesData) {
        const activityType = p.type || 'Práctica';
        const act = await Activity.create({
          title: p.title,
          type: activityType,
          theme: p.theme
        });

        let order = 0;
        for (const q of p.questions) {
          const options = JSON.stringify([q.a, q.b, q.c]);
          await Question.create({
            activity_id: act.id,
            question_text: q.q,
            question_type: 'opcion',
            options,
            correct_answer: q.correct,
            order_num: order++
          });
        }
      }
      console.log('✅ Practice Modules seeded successfully.');
    }
    
    // Seed students
    const studentCount = await Student.countDocuments();
    
    if (studentCount === 0) {
      console.log('🌱 Seeding Students from Excel list...');
      const studentsData = require('./students_seed.json');
      
      let listNumbers = {};

      for (const s of studentsData) {
        let grp = await Group.findOne({ name: s.groupName });
        if (!grp) {
          grp = await Group.create({ name: s.groupName });
        }
        const groupId = grp.id;
        
        if (!listNumbers[groupId]) listNumbers[groupId] = 1;
        const listNum = listNumbers[groupId]++;
        
        await Student.create({
          full_name: s.name,
          username: s.username,
          password: '123',
          group_id: groupId,
          list_number: listNum
        });
      }
      console.log('✅ Students seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding practices:', err);
  }
}

module.exports = seedPractices;

