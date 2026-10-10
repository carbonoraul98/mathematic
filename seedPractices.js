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

