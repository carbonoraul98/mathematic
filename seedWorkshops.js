const { connectionPromise, Activity, Question, Group } = require('./models/database');

async function seedWorkshops() {
    await connectionPromise;
    console.log('Conectado a la base de datos...');

    const groups = await Group.find({}, 'id');
    const allGroupIds = groups.map(g => g.id);
    const defaultGroup = allGroupIds[0] || 1;

    const workshopsData = [
        {
            title: 'Taller 1: Fracciones, Geometría y Coordenadas',
            type: 'Taller',
            theme: 'Grado 5 - Geometría y Fracciones',
            group_id: defaultGroup,
            target_groups: allGroupIds,
            questions: [
                {
                    q: 'Observa los modelos circulares: ¿Cuál es la fracción equivalente a 2/4 representada en el segundo modelo? [grafico:pies:4,2,#8B5CF6|8,4,#06B6D4:2/4 = 4/8]',
                    a: '4/8',
                    b: '3/8',
                    c: '5/8',
                    correct: '4/8'
                },
                {
                    q: 'Observa las dos rectas numéricas graduadas de 0 a 1: ¿La fracción 1/2 y la fracción 2/4 representan el mismo punto? [grafico:dual_lines:2,1,#3B82F6|4,2,#10B981]',
                    a: 'Sí, son equivalentes y se ubican en el mismo punto',
                    b: 'No, 2/4 está más a la derecha',
                    c: 'No, 1/2 es mayor',
                    correct: 'Sí, son equivalentes y se ubican en el mismo punto'
                },
                {
                    q: 'Ubica la fracción señalada en la recta numérica dividida en doceavos: ¿A qué fracción corresponde la marca azul? [grafico:single_line:12:3:#3B82F6]',
                    a: '3/12',
                    b: '4/12',
                    c: '2/12',
                    correct: '3/12'
                },
                {
                    q: 'Observa el plano cartesiano con cuadrícula de 10x10: ¿Qué figura geométrica está situada exactamente en las coordenadas (10, 6)? [grafico:plane:heart,6,10,#10B981|star,5,5,#818CF8|circle,9,5,#FBBF24|pentagon,10,6,#38BDF8]',
                    a: 'Pentágono azul',
                    b: 'Corazón verde',
                    c: 'Estrella lila',
                    correct: 'Pentágono azul'
                },
                {
                    q: 'En el plano cartesiano: ¿Cuáles son las coordenadas (x, y) donde se encuentra el corazón verde? [grafico:plane:heart,6,10,#10B981|star,5,5,#818CF8|circle,9,5,#FBBF24|pentagon,10,6,#38BDF8]',
                    a: '(6, 10)',
                    b: '(10, 6)',
                    c: '(6, 6)',
                    correct: '(6, 10)'
                }
            ]
        },
        {
            title: 'Taller 2: Aritmética Avanzada, Álgebra y Estadística',
            type: 'Taller',
            theme: 'Grado 5 - Aritmética y Estadística',
            group_id: defaultGroup,
            target_groups: allGroupIds,
            questions: [
                {
                    q: 'Resuelve la multiplicación en columna: 425 × 36 [grafico:vertical_mult:425:36]',
                    a: '15300',
                    b: '14800',
                    c: '15700',
                    correct: '15300'
                },
                {
                    q: 'Resuelve la división y halla el cociente exacto: 1848 ÷ 24 [grafico:vertical_div:1848:24]',
                    a: '77',
                    b: '73',
                    c: '81',
                    correct: '77'
                },
                {
                    q: 'Observa el gráfico de barras sobre las materias favoritas: ¿Cuántos votos sumaron juntos Matemáticas y Ciencias? [grafico:bar_chart:Matemáticas,35,#3B82F6|Ciencias,25,#10B981|Historia,15,#F59E0B|Arte,20,#EC4899:Materias Favoritas de 5to Grado]',
                    a: '60 votos',
                    b: '55 votos',
                    c: '50 votos',
                    correct: '60 votos'
                },
                {
                    q: 'En 5 evaluaciones de matemáticas un estudiante obtuvo las notas: 8, 9, 10, 7 y 6. ¿Cuál es su promedio (media aritmética)?',
                    a: '8',
                    b: '7.5',
                    c: '8.5',
                    correct: '8'
                },
                {
                    q: 'Resuelve la ecuación y calcula el valor de la incógnita x: [grafico:algebra:3x + 12 = 45:Halla x]',
                    a: '11',
                    b: '9',
                    c: '14',
                    correct: '11'
                }
            ]
        }
    ];

    for (const w of workshopsData) {
        // Verificar si ya existe para evitar duplicación
        const existing = await Activity.findOne({ title: w.title });
        if (existing) {
            console.log(`El taller "${w.title}" ya existe con ID ${existing.id}. Actualizando preguntas...`);
            await Question.deleteMany({ activity_id: existing.id });
            for (let i = 0; i < w.questions.length; i++) {
                const q = w.questions[i];
                await Question.create({
                    activity_id: existing.id,
                    question_text: q.q,
                    question_type: 'opcion',
                    options: JSON.stringify([q.a, q.b, q.c]),
                    correct_answer: q.correct,
                    points: 10,
                    order_num: i
                });
            }
            continue;
        }

        const newAct = await Activity.create({
            title: w.title,
            type: w.type,
            theme: w.theme,
            group_id: w.group_id,
            target_groups: w.target_groups
        });
        console.log(`Taller creado: "${newAct.title}" con ID ${newAct.id}`);

        for (let i = 0; i < w.questions.length; i++) {
            const q = w.questions[i];
            await Question.create({
                activity_id: newAct.id,
                question_text: q.q,
                question_type: 'opcion',
                options: JSON.stringify([q.a, q.b, q.c]),
                correct_answer: q.correct,
                points: 10,
                order_num: i
            });
        }
        console.log(`Se insertaron ${w.questions.length} preguntas en "${newAct.title}"`);
    }

    console.log('¡Talleres creados exitosamente!');
    process.exit(0);
}

seedWorkshops().catch(err => {
    console.error('Error al insertar talleres:', err);
    process.exit(1);
});
