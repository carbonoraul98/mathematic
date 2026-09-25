const db = require('./models/database');

const practicesData = [
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
    title: 'Fracciones', theme: 'Grado 5',
    questions: [
      { q: "¿Cuál de estas es la mitad?", a: "1/4", b: "1/3", c: "1/2", correct: "1/2" },
      { q: "¿Cuánto es 1/4 + 1/4?", a: "2/8", b: "1/2", c: "1/4", correct: "1/2" },
      { q: "¿Qué fracción es mayor?", a: "1/2", b: "1/4", c: "1/8", correct: "1/2" }
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
    // Check if practices exist
    const stmt = await db.prepare("SELECT COUNT(*) as count FROM activities WHERE type = 'Práctica'");
    const res = await stmt.get();
    
    if (res && res.count === 0) {
      console.log('🌱 Seeding Practice Modules...');
      
      const insertAct = await db.prepare("INSERT INTO activities (title, type, theme) VALUES (?, 'Práctica', ?) RETURNING id");
      const insertQ = await db.prepare("INSERT INTO questions (activity_id, question_text, question_type, options, correct_answer) VALUES (?, ?, 'opcion', ?, ?)");
      
      for (const p of practicesData) {
        let actId;
        // The SQLite wrapper we have might not support RETURNING cleanly across postgres/sqlite wrapper
        // So let's do normal insert and then get the last ID.
        const activityType = p.type || 'Práctica';
        
        if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')) {
            const insertActPg = await db.prepare("INSERT INTO activities (title, type, theme) VALUES ($1, $2, $3) RETURNING id");
            const resPg = await insertActPg.run(p.title, activityType, p.theme);
            actId = resPg.lastInsertRowid; // The wrapper maps result.rows[0]?.id to lastInsertRowid
        } else {
            const insertActSq = await db.prepare("INSERT INTO activities (title, type, theme) VALUES (?, ?, ?)");
            const resSq = await insertActSq.run(p.title, activityType, p.theme);
            actId = resSq.lastInsertRowid;
        }

        if (actId) {
            for (const q of p.questions) {
                const options = JSON.stringify([q.a, q.b, q.c]);
                if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')) {
                    const insertQPg = await db.prepare("INSERT INTO questions (activity_id, question_text, question_type, options, correct_answer) VALUES ($1, $2, 'opcion', $3, $4)");
                    await insertQPg.run(actId, q.q, options, q.correct);
                } else {
                    const insertQSq = await db.prepare("INSERT INTO questions (activity_id, question_text, question_type, options, correct_answer) VALUES (?, ?, 'opcion', ?, ?)");
                    await insertQSq.run(actId, q.q, options, q.correct);
                }
            }
        }
      }
      console.log('✅ Practice Modules seeded successfully.');
    }
    
    // Seed students
    const stmtStudents = await db.prepare("SELECT COUNT(*) as count FROM students");
    const resStudents = await stmtStudents.get();
    
    if (resStudents && resStudents.count === 0) {
      console.log('🌱 Seeding Students from Excel list...');
      const studentsData = require('./students_seed.json');
      
      let listNumbers = {};

      for (const s of studentsData) {
        let groupId;
        const isPg = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://');
        
        // Find or insert group
        let grp = isPg ? await (await db.prepare("SELECT id FROM groups WHERE name = $1")).get(s.groupName) : await (await db.prepare("SELECT id FROM groups WHERE name = ?")).get(s.groupName);
        
        if (!grp) {
            isPg ? await (await db.prepare("INSERT INTO groups (name) VALUES ($1)")).run(s.groupName) : await (await db.prepare("INSERT INTO groups (name) VALUES (?)")).run(s.groupName);
            grp = isPg ? await (await db.prepare("SELECT id FROM groups WHERE name = $1")).get(s.groupName) : await (await db.prepare("SELECT id FROM groups WHERE name = ?")).get(s.groupName);
        }
        groupId = grp.id;
        
        // Insert student
        if (!listNumbers[groupId]) listNumbers[groupId] = 1;
        const listNum = listNumbers[groupId]++;
        
        const insertStudentPg = "INSERT INTO students (full_name, username, password, group_id, list_number) VALUES ($1, $2, $3, $4, $5)";
        const insertStudentSq = "INSERT INTO students (full_name, username, password, group_id, list_number) VALUES (?, ?, ?, ?, ?)";
        const defaultPassword = '123';
        if (isPg) {
            await (await db.prepare(insertStudentPg)).run(s.name, s.username, defaultPassword, groupId, listNum);
        } else {
            await (await db.prepare(insertStudentSq)).run(s.name, s.username, defaultPassword, groupId, listNum);
        }
      }
      console.log('✅ Students seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding practices:', err);
  }
}

module.exports = seedPractices;
