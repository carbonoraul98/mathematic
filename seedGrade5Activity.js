const { connectionPromise, Activity, Question, Group } = require('./models/database');

const grade5Questions = [
    {
        q: "¿Cuál es el Máximo Común Divisor (MCD) de 24 y 36?",
        opts: ["12", "6", "8", "4"],
        correct: "12"
    },
    {
        q: "¿Cuál es el Mínimo Común Múltiplo (MCM) de 6 y 8?",
        opts: ["24", "48", "18", "16"],
        correct: "24"
    },
    {
        q: "Calcula el resultado de multiplicar: 324 × 25",
        opts: ["8.100", "7.950", "8.200", "7.800"],
        correct: "8.100"
    },
    {
        q: "¿Cuál es el valor de 4³ (4 elevado a la 3)?",
        opts: ["64", "12", "16", "32"],
        correct: "64"
    },
    {
        q: "Calcula el cociente de dividir: 1.458 ÷ 6",
        opts: ["243", "241", "253", "234"],
        correct: "243"
    },
    {
        q: "Resuelve la suma de fracciones: 2/3 + 1/4",
        opts: ["11/12", "3/7", "8/12", "3/12"],
        correct: "11/12"
    },
    {
        q: "Calcula el resultado de: 4/5 - 1/2",
        opts: ["3/10", "3/3", "1/10", "2/5"],
        correct: "3/10"
    },
    {
        q: "¿Cuál es el producto de 3/4 × 2/5 (simplificado a su mínima expresión)?",
        opts: ["3/10", "6/20", "5/9", "1/2"],
        correct: "3/10"
    },
    {
        q: "Calcula el resultado de: 2/3 ÷ 4/5",
        opts: ["5/6", "8/15", "6/5", "7/9"],
        correct: "5/6"
    },
    {
        q: "En el número decimal 45,678, ¿qué posición ocupa el dígito 7?",
        opts: ["Centésimas", "Décimas", "Milésimas", "Decenas"],
        correct: "Centésimas"
    },
    {
        q: "Redondea el número 18,76 a la décima más cercana:",
        opts: ["18,8", "18,7", "19,0", "18,75"],
        correct: "18,8"
    },
    {
        q: "Calcula el resultado respetando el orden de las operaciones: 15 + 4 × (8 - 3)",
        opts: ["35", "95", "27", "45"],
        correct: "35"
    },
    {
        q: "Resuelve la operación mixta con decimales: 3,5 × 2 + 1,4 ÷ 2",
        opts: ["7,7", "7,4", "8,4", "6,7"],
        correct: "7,7"
    },
    {
        q: "¿Cuál de las siguientes relaciones de orden entre números enteros es correcta?",
        opts: ["-5 < -2", "-8 > -3", "-1 < -6", "0 < -4"],
        correct: "-5 < -2"
    },
    {
        q: "¿Cuántos metros hay en 3,8 kilómetros (km)?",
        opts: ["3.800 m", "380 m", "38.000 m", "38 m"],
        correct: "3.800 m"
    },
    {
        q: "¿A cuántos gramos (g) equivalen 2,5 kilogramos (kg)?",
        opts: ["2.500 g", "250 g", "25.000 g", "500 g"],
        correct: "2.500 g"
    },
    {
        q: "Un triángulo que tiene sus 3 lados de diferente longitud y uno de sus ángulos mide 90° es:",
        opts: ["Escaleno y rectángulo", "Isósceles y acutángulo", "Equilátero y rectángulo", "Escaleno y obtusángulo"],
        correct: "Escaleno y rectángulo"
    },
    {
        q: "El segmento que une el centro del círculo con cualquier punto de la circunferencia se llama:",
        opts: ["Radio", "Diámetro", "Cuerda", "Arco"],
        correct: "Radio"
    },
    {
        q: "¿Cuántas aristas tiene una pirámide de base cuadrada?",
        opts: ["8", "5", "6", "10"],
        correct: "8"
    },
    {
        q: "¿Qué característica define a un polígono cóncavo?",
        opts: [
            "Al menos uno de sus ángulos interiores mide más de 180°",
            "Todos sus ángulos interiores miden menos de 180°",
            "Todos sus lados son iguales",
            "No tiene diagonales"
        ],
        correct: "Al menos uno de sus ángulos interiores mide más de 180°"
    }
];

async function seedGrade5Activity() {
    await connectionPromise;

    // Identificar grupos de 5to (5A, 5B, 5C)
    const groups5 = await Group.find({ name: { $regex: /^5/i } });
    const group5Ids = groups5.map(g => g.id);

    // Buscar si ya existe la actividad oficial de 5to
    let act = await Activity.findOne({ title: 'Actividad de Matemáticas - 5° Grado' });
    if (!act) {
        act = await Activity.create({
            title: 'Actividad de Matemáticas - 5° Grado',
            type: 'Actividad',
            theme: 'Grado 5',
            group_id: group5Ids[0] || 3,
            target_groups: group5Ids.length > 0 ? group5Ids : [3, 4, 5],
            is_training_level: false
        });
        console.log(`✅ Creada actividad 5° Grado con ID: ${act.id}`);
    } else {
        act.theme = 'Grado 5';
        act.target_groups = group5Ids.length > 0 ? group5Ids : [3, 4, 5];
        await act.save();
        console.log(`ℹ️ Actualizando actividad 5° Grado existente ID: ${act.id}`);
    }

    // Limpiar preguntas anteriores de esta actividad
    await Question.deleteMany({ activity_id: act.id });

    // Insertar las 20 preguntas con opciones barajadas
    for (let i = 0; i < grade5Questions.length; i++) {
        const item = grade5Questions[i];
        const shuffled = [...item.opts];
        for (let j = shuffled.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
        }

        await Question.create({
            activity_id: act.id,
            question_text: item.q,
            question_type: 'opcion',
            options: JSON.stringify(shuffled),
            correct_answer: item.correct,
            points: 10,
            order_num: i
        });
    }

    // Retirar talleres anteriores si existen para que cada grado tenga su actividad principal
    await Activity.deleteMany({ id: { $in: [26, 27] } });
    await Question.deleteMany({ activity_id: { $in: [26, 27] } });

    console.log(`✅ Insertadas exitosamente 20 preguntas para la actividad de 5° Grado (ID: ${act.id})`);
}

if (require.main === module) {
    seedGrade5Activity().then(() => {
        process.exit(0);
    }).catch(err => {
        console.error('Error al sembrar actividad de 5°:', err);
        process.exit(1);
    });
}

module.exports = seedGrade5Activity;
