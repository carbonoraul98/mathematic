const { connectionPromise, Activity, Question, Group } = require('./models/database');

async function seedGrade4() {
    await connectionPromise;
    console.log('Conectado a la base de datos para actualizar prácticas de 4to grado...');

    const groups = await Group.find({}, 'id');
    const allGroupIds = groups.map(g => g.id);
    const defaultGroup = allGroupIds[0] || 1;

    const grade4Practices = [
        {
            id: 2, // Reemplaza la antigua "Suma"
            title: 'Multiplicación 2 Cifras I',
            theme: 'Grado 4',
            type: 'Práctica',
            questions: [
                {
                    q: 'Resuelve la multiplicación en columna: 24 × 15 [grafico:vertical_mult:24:15]',
                    a: '360',
                    b: '340',
                    c: '380',
                    correct: '360'
                },
                {
                    q: 'Calcula el producto de los dos factores: 36 × 12 [grafico:vertical_mult:36:12]',
                    a: '432',
                    b: '412',
                    c: '452',
                    correct: '432'
                },
                {
                    q: 'Multiplica en columna vertical: 45 × 14 [grafico:vertical_mult:45:14]',
                    a: '630',
                    b: '590',
                    c: '650',
                    correct: '630'
                },
                {
                    q: 'Calcula el resultado: 52 × 18 [grafico:vertical_mult:52:18]',
                    a: '936',
                    b: '896',
                    c: '956',
                    correct: '936'
                },
                {
                    q: 'Multiplica los números de dos cifras: 63 × 21 [grafico:vertical_mult:63:21]',
                    a: '1323',
                    b: '1283',
                    c: '1343',
                    correct: '1323'
                }
            ]
        },
        {
            id: 3, // Reemplaza la antigua "Resta"
            title: 'Multiplicación 2 Cifras II',
            theme: 'Grado 4',
            type: 'Práctica',
            questions: [
                {
                    q: 'Resuelve la multiplicación en columna: 48 × 35 [grafico:vertical_mult:48:35]',
                    a: '1680',
                    b: '1580',
                    c: '1720',
                    correct: '1680'
                },
                {
                    q: 'Calcula el producto de los números: 62 × 24 [grafico:vertical_mult:62:24]',
                    a: '1488',
                    b: '1428',
                    c: '1518',
                    correct: '1488'
                },
                {
                    q: 'Multiplica en columna: 75 × 18 [grafico:vertical_mult:75:18]',
                    a: '1350',
                    b: '1290',
                    c: '1380',
                    correct: '1350'
                },
                {
                    q: 'Calcula el resultado: 86 × 15 [grafico:vertical_mult:86:15]',
                    a: '1290',
                    b: '1240',
                    c: '1310',
                    correct: '1290'
                },
                {
                    q: 'Multiplica los factores: 54 × 36 [grafico:vertical_mult:54:36]',
                    a: '1944',
                    b: '1884',
                    c: '1964',
                    correct: '1944'
                }
            ]
        },
        {
            id: 4, // Actualiza la antigua "Multiplicación" de 1 cifra a división de 2 cifras
            title: 'División 2 Cifras I',
            theme: 'Grado 4',
            type: 'Práctica',
            questions: [
                {
                    q: 'Calcula el cociente exacto en galera: 360 ÷ 12 [grafico:vertical_div:360:12]',
                    a: '30',
                    b: '28',
                    c: '32',
                    correct: '30'
                },
                {
                    q: 'Resuelve la división: 450 ÷ 15 [grafico:vertical_div:450:15]',
                    a: '30',
                    b: '25',
                    c: '35',
                    correct: '30'
                },
                {
                    q: 'Calcula el cociente en galera: 288 ÷ 24 [grafico:vertical_div:288:24]',
                    a: '12',
                    b: '14',
                    c: '11',
                    correct: '12'
                },
                {
                    q: 'Resuelve la división: 520 ÷ 20 [grafico:vertical_div:520:20]',
                    a: '26',
                    b: '24',
                    c: '28',
                    correct: '26'
                },
                {
                    q: 'Calcula el resultado exacto: 625 ÷ 25 [grafico:vertical_div:625:25]',
                    a: '25',
                    b: '23',
                    c: '27',
                    correct: '25'
                }
            ]
        },
        {
            id: 17, // Actualiza a división de 2 cifras II
            title: 'División 2 Cifras II',
            theme: 'Grado 4',
            type: 'Práctica',
            questions: [
                {
                    q: 'Resuelve la división en galera: 672 ÷ 21 [grafico:vertical_div:672:21]',
                    a: '32',
                    b: '28',
                    c: '34',
                    correct: '32'
                },
                {
                    q: 'Calcula el cociente: 750 ÷ 25 [grafico:vertical_div:750:25]',
                    a: '30',
                    b: '28',
                    c: '32',
                    correct: '30'
                },
                {
                    q: 'Resuelve la división de tres cifras entre dos cifras: 896 ÷ 28 [grafico:vertical_div:896:28]',
                    a: '32',
                    b: '30',
                    c: '34',
                    correct: '32'
                },
                {
                    q: 'Calcula el cociente en galera: 864 ÷ 36 [grafico:vertical_div:864:36]',
                    a: '24',
                    b: '22',
                    c: '26',
                    correct: '24'
                },
                {
                    q: 'Resuelve la operación: 930 ÷ 31 [grafico:vertical_div:930:31]',
                    a: '30',
                    b: '28',
                    c: '32',
                    correct: '30'
                }
            ]
        },
        {
            id: 28, // Nueva práctica de Fracciones Sencillas I
            title: 'Fracciones Sencillas I',
            theme: 'Grado 4',
            type: 'Práctica',
            questions: [
                {
                    q: '¿Qué fracción representa la parte coloreada del modelo circular? [grafico:pies:4,3,#3B82F6:Modelo de Fracción]',
                    a: '3/4',
                    b: '1/4',
                    c: '2/4',
                    correct: '3/4'
                },
                {
                    q: 'Observa el círculo dividido en partes iguales: ¿Qué fracción está sombreada? [grafico:pies:2,1,#10B981:Modelo de Fracción]',
                    a: '1/2',
                    b: '1/4',
                    c: '2/2',
                    correct: '1/2'
                },
                {
                    q: '¿Qué fracción corresponde a las piezas de color en el modelo? [grafico:pies:3,2,#F59E0B:Modelo de Fracción]',
                    a: '2/3',
                    b: '1/3',
                    c: '3/3',
                    correct: '2/3'
                },
                {
                    q: 'Observa el modelo dividido en 6 partes iguales: ¿Qué fracción representa la zona marcada? [grafico:pies:6,2,#8B5CF6:Modelo de Fracción]',
                    a: '2/6',
                    b: '3/6',
                    c: '1/6',
                    correct: '2/6'
                },
                {
                    q: 'Si un pastel se divide en 8 porciones y se comen 5 porciones, ¿qué fracción representa la parte comida? [grafico:pies:8,5,#EC4899:Modelo de Fracción]',
                    a: '5/8',
                    b: '3/8',
                    c: '4/8',
                    correct: '5/8'
                }
            ]
        },
        {
            id: 29, // Nueva práctica de Fracciones Sencillas II
            title: 'Fracciones Sencillas II',
            theme: 'Grado 4',
            type: 'Práctica',
            questions: [
                {
                    q: 'Observa la recta numérica de 0 a 1 dividida en cuartos: ¿Qué fracción marca el punto azul? [grafico:single_line:4:2:#3B82F6]',
                    a: '2/4 (equivalente a 1/2)',
                    b: '1/4',
                    c: '3/4',
                    correct: '2/4 (equivalente a 1/2)'
                },
                {
                    q: 'Identifica la fracción marcada en la recta numérica dividida en tercios: [grafico:single_line:3:1:#10B981]',
                    a: '1/3',
                    b: '2/3',
                    c: '3/3',
                    correct: '1/3'
                },
                {
                    q: '¿Qué fracción representa el punto señalado en la recta numérica en octavos? [grafico:single_line:8:4:#F59E0B]',
                    a: '4/8 (la mitad)',
                    b: '2/8',
                    c: '6/8',
                    correct: '4/8 (la mitad)'
                },
                {
                    q: 'Observa la recta graduada en doceavos: ¿En qué fracción se encuentra el marcador? [grafico:single_line:12:6:#8B5CF6]',
                    a: '6/12',
                    b: '4/12',
                    c: '8/12',
                    correct: '6/12'
                },
                {
                    q: '¿Cuál de las siguientes fracciones es mayor: 3/4 o 1/4? Observa que 3 partes de 4 es mayor que 1 parte.',
                    a: '3/4',
                    b: '1/4',
                    c: 'Son iguales',
                    correct: '3/4'
                }
            ]
        }
    ];

    for (const p of grade4Practices) {
        let act = await Activity.findOne({ id: p.id });
        if (!act) {
            act = await Activity.create({
                id: p.id,
                title: p.title,
                type: p.type,
                theme: p.theme,
                group_id: defaultGroup,
                target_groups: allGroupIds
            });
            console.log(`Creada actividad ID ${act.id}: "${act.title}"`);
        } else {
            act.title = p.title;
            act.type = p.type;
            act.theme = p.theme;
            act.target_groups = allGroupIds;
            await act.save();
            console.log(`Actualizada actividad ID ${act.id}: "${act.title}"`);
        }

        // Reemplazar preguntas
        await Question.deleteMany({ activity_id: act.id });
        for (let i = 0; i < p.questions.length; i++) {
            const q = p.questions[i];
            await Question.create({
                activity_id: act.id,
                question_text: q.q,
                question_type: 'opcion',
                options: JSON.stringify([q.a, q.b, q.c]),
                correct_answer: q.correct,
                points: 10,
                order_num: i
            });
        }
        console.log(`  -> Insertadas ${p.questions.length} preguntas en ID ${act.id}`);
    }

    console.log('¡Prácticas de 4to grado actualizadas con éxito!');
    process.exit(0);
}

seedGrade4().catch(err => {
    console.error('Error al actualizar prácticas de 4to:', err);
    process.exit(1);
});
