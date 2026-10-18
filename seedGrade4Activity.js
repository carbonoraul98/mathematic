const { connectionPromise, Activity, Question, Group } = require('./models/database');

const grade4Questions = [
    {
        q: "¿Cuál es el valor del dígito 7 en el número 47.520?",
        opts: ["7.000", "700", "70.000", "70"],
        correct: "7.000"
    },
    {
        q: "Redondea el número 3.682 a la centena más cercana.",
        opts: ["3.700", "3.600", "3.680", "4.000"],
        correct: "3.700"
    },
    {
        q: "¿Cuál de los siguientes números es un número primo?",
        opts: ["13", "15", "21", "9"],
        correct: "13"
    },
    {
        q: "¿Cuál de los siguientes números es múltiplo común de 4 y 6?",
        opts: ["24", "16", "18", "14"],
        correct: "24"
    },
    {
        q: "Calcula el resultado de sumar: 4.856 + 3.479",
        opts: ["8.335", "8.235", "8.325", "7.335"],
        correct: "8.335"
    },
    {
        q: "Calcula el resultado de restar: 8.000 - 3.426",
        opts: ["4.574", "4.674", "5.574", "4.584"],
        correct: "4.574"
    },
    {
        q: "¿Qué número falta en la operación: 2.500 + ___ = 6.200?",
        opts: ["3.700", "3.500", "4.700", "3.800"],
        correct: "3.700"
    },
    {
        q: "En la multiplicación: 8 × ___ = 72, ¿cuál es el factor que falta?",
        opts: ["9", "8", "7", "6"],
        correct: "9"
    },
    {
        q: "Calcula el producto de: 45 × 23",
        opts: ["1.035", "1.025", "935", "1.135"],
        correct: "1.035"
    },
    {
        q: "¿Cuánto es 600 × 40?",
        opts: ["24.000", "2.400", "240.000", "240"],
        correct: "24.000"
    },
    {
        q: "¿Cuál de las siguientes fracciones es equivalente a 2/3?",
        opts: ["4/6", "3/4", "2/6", "4/9"],
        correct: "4/6"
    },
    {
        q: "Si simplificas la fracción 12/16 a su mínima expresión, obtienes:",
        opts: ["3/4", "6/8", "2/3", "1/2"],
        correct: "3/4"
    },
    {
        q: "¿Cuál de las siguientes comparaciones de fracciones es correcta?",
        opts: ["5/8 > 3/8", "2/7 > 4/7", "1/5 > 3/5", "4/9 < 2/9"],
        correct: "5/8 > 3/8"
    },
    {
        q: "¿Cuál fracción es MAYOR: 3/4 o 3/8?",
        opts: ["3/4", "3/8", "Son iguales", "No se pueden comparar"],
        correct: "3/4"
    },
    {
        q: "En una recta numérica, si partes del punto 5 y retrocedes 8 unidades, ¿a qué número llegas?",
        opts: ["-3", "3", "-2", "0"],
        correct: "-3"
    },
    {
        q: "¿A cuántos centímetros equivalen 4 metros y medio (4,5 m)?",
        opts: ["450 cm", "45 cm", "4.500 cm", "405 cm"],
        correct: "450 cm"
    },
    {
        q: "Una botella contiene 2 litros de agua. ¿A cuántos mililitros (ml) equivale?",
        opts: ["2.000 ml", "200 ml", "20.000 ml", "500 ml"],
        correct: "2.000 ml"
    },
    {
        q: "¿Cuántos minutos hay en 3 horas y cuarto (3 h 15 min)?",
        opts: ["195 minutos", "180 minutos", "215 minutos", "165 minutos"],
        correct: "195 minutos"
    },
    {
        q: "¿Cuántos vértices y cuántas caras tiene un cubo?",
        opts: ["8 vértices y 6 caras", "6 vértices y 8 caras", "12 vértices y 6 caras", "8 vértices y 12 caras"],
        correct: "8 vértices y 6 caras"
    },
    {
        q: "Un ángulo que mide 120° se clasifica como un ángulo:",
        opts: ["Obtuso", "Agudo", "Recto", "Llano"],
        correct: "Obtuso"
    }
];

async function seedGrade4Activity() {
    await connectionPromise;

    // Buscar o identificar grupos de 4to
    const groups4 = await Group.find({ name: { $regex: /^4/i } });
    const group4Ids = groups4.map(g => g.id);

    // Buscar si ya existe la actividad de 4to para no duplicarla
    let act = await Activity.findOne({ title: 'Actividad de Matemáticas - 4° Grado' });
    if (!act) {
        act = await Activity.create({
            title: 'Actividad de Matemáticas - 4° Grado',
            type: 'Actividad',
            theme: 'Grado 4',
            group_id: group4Ids[0] || 1,
            target_groups: group4Ids.length > 0 ? group4Ids : [1, 2],
            is_training_level: false
        });
        console.log(`✅ Creada actividad 4° Grado con ID: ${act.id}`);
    } else {
        act.theme = 'Grado 4';
        act.target_groups = group4Ids.length > 0 ? group4Ids : [1, 2];
        await act.save();
        console.log(`ℹ️ Actualizando actividad 4° Grado existente ID: ${act.id}`);
    }

    // Limpiar preguntas anteriores de esta actividad
    await Question.deleteMany({ activity_id: act.id });

    // Insertar las 20 preguntas con orden aleatorizado de opciones
    for (let i = 0; i < grade4Questions.length; i++) {
        const item = grade4Questions[i];
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

    console.log(`✅ Insertadas exitosamente 20 preguntas para la actividad de 4° Grado (ID: ${act.id})`);
}

if (require.main === module) {
    seedGrade4Activity().then(() => {
        process.exit(0);
    }).catch(err => {
        console.error('Error al sembrar actividad de 4°:', err);
        process.exit(1);
    });
}

module.exports = seedGrade4Activity;
