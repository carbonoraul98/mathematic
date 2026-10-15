const { connectionPromise, Activity, Question, Group } = require('./models/database');

async function seedOperacionesMixtas() {
    await connectionPromise;
    console.log('Conectado a MongoDB para sembrar módulos de Operaciones Mixtas (5° Grado)...');

    const groups = await Group.find({}, 'id');
    const allGroupIds = groups.map(g => g.id);
    const defaultGroup = allGroupIds[0] || 1;

    const newPractices = [
        {
            id: 30,
            title: 'Operaciones Mixtas I',
            theme: 'Grado 5 - Operaciones Mixtas',
            type: 'Práctica',
            questions: [
                {
                    q: 'Resuelve respetando el orden de las operaciones: 15 + 6 × 4',
                    a: '39',
                    b: '84',
                    c: '45',
                    correct: '39'
                },
                {
                    q: 'Calcula la operación con paréntesis: (32 - 12) ÷ (2 × 2)',
                    a: '5',
                    b: '8',
                    c: '10',
                    correct: '5'
                },
                {
                    q: 'Resuelve la operación combinada: 50 - 4 × 8 + 12',
                    a: '30',
                    b: '22',
                    c: '42',
                    correct: '30'
                },
                {
                    q: 'Calcula el resultado: 120 ÷ 4 × 2 + 10',
                    a: '70',
                    b: '25',
                    c: '65',
                    correct: '70'
                },
                {
                    q: 'Un depósito tiene 300 litros de agua. Se extraen 4 bidones de 25 litros y luego se agregan 50 litros. ¿Cuántos litros quedan?',
                    a: '250 litros',
                    b: '200 litros',
                    c: '280 litros',
                    correct: '250 litros'
                }
            ]
        },
        {
            id: 31,
            title: 'Operaciones Mixtas II',
            theme: 'Grado 5 - Operaciones Mixtas',
            type: 'Práctica',
            questions: [
                {
                    q: 'Resuelve la operación con fracciones: 1/2 + (3/4 × 2/3)',
                    a: '1',
                    b: '3/4',
                    c: '5/6',
                    correct: '1'
                },
                {
                    q: 'Calcula la operación combinada con decimales: 4.5 × 2 + 3.6 ÷ 2',
                    a: '10.8',
                    b: '9.8',
                    c: '11.2',
                    correct: '10.8'
                },
                {
                    q: 'Calcula la resta y multiplicación con decimales: 20.5 - 3.5 × 4',
                    a: '6.5',
                    b: '68.0',
                    c: '8.5',
                    correct: '6.5'
                },
                {
                    q: 'Resuelve la operación con fracciones y paréntesis: (5/8 - 1/8) ÷ 1/2',
                    a: '1',
                    b: '1/2',
                    c: '2',
                    correct: '1'
                },
                {
                    q: 'Lucía compró 3.5 kg de fruta. Usó 1.2 kg en un batido y luego compró 0.7 kg más. ¿Cuántos kg de fruta tiene ahora?',
                    a: '3.0 kg',
                    b: '2.8 kg',
                    c: '3.2 kg',
                    correct: '3.0 kg'
                }
            ]
        }
    ];

    for (const p of newPractices) {
        let act = await Activity.findOne({ id: p.id });
        if (!act) {
            act = await Activity.create({
                id: p.id,
                title: p.title,
                theme: p.theme,
                type: p.type,
                group_id: defaultGroup,
                target_groups: allGroupIds
            });
            console.log(`Creada actividad ID ${p.id}: "${p.title}"`);
        } else {
            act.title = p.title;
            act.theme = p.theme;
            act.type = p.type;
            await act.save();
            console.log(`Actualizada actividad ID ${p.id}: "${p.title}"`);
        }

        await Question.deleteMany({ activity_id: act.id });

        for (let i = 0; i < p.questions.length; i++) {
            const q = p.questions[i];
            const opts = [q.a, q.b, q.c];
            // Barajar opciones aleatoriamente
            for (let j = opts.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [opts[j], opts[k]] = [opts[k], opts[j]];
            }

            await Question.create({
                activity_id: act.id,
                question_text: q.q,
                question_type: 'opcion',
                options: JSON.stringify(opts),
                correct_answer: q.correct,
                points: 10,
                order_num: i
            });
        }
        console.log(`  -> Insertadas ${p.questions.length} preguntas en ID ${act.id}`);
    }

    console.log('✅ Módulos de Operaciones Mixtas para 5° grado sembrados exitosamente.');
}

if (require.main === module) {
    seedOperacionesMixtas()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Error al sembrar operaciones mixtas:', err);
            process.exit(1);
        });
}

module.exports = seedOperacionesMixtas;
