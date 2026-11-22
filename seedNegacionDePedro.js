const { connectionPromise, Activity, Question, Group, Subject, CourseAssignment } = require('./models/database');

const negacionPedroQuestions = [
    {
        q: "¿En qué momento anunció Jesús que Pedro lo negaría?",
        opts: [
            "Durante la Última Cena, antes de salir hacia el monte de los Olivos",
            "Cuando multiplicó los panes y los peces en Galilea",
            "Al inicio de su ministerio en el río Jordán",
            "Después de la resurrección camino a Emaús"
        ],
        correct: "Durante la Última Cena, antes de salir hacia el monte de los Olivos"
    },
    {
        q: "¿Cuántas veces dijo Jesús que Pedro lo negaría antes de que cantara el gallo?",
        opts: [
            "Tres veces",
            "Dos veces",
            "Siete veces",
            "Una sola vez"
        ],
        correct: "Tres veces"
    },
    {
        q: "¿Cuál fue la respuesta de Pedro cuando Jesús advirtió que todos se escandalizarían aquella noche?",
        opts: [
            "Aseguró con firmeza que estaba dispuesto a ir con Jesús a la cárcel y a la muerte",
            "Guardó silencio y se retiró inmediatamente del aposento alto",
            "Pidió a los demás discípulos que huyeran hacia Galilea",
            "Dijo que no conocía el camino hacia el huerto de Getsemaní"
        ],
        correct: "Aseguró con firmeza que estaba dispuesto a ir con Jesús a la cárcel y a la muerte"
    },
    {
        q: "Tras el arresto de Jesús en Getsemaní, ¿cómo lo siguió Pedro y hasta dónde llegó?",
        opts: [
            "Lo siguió de lejos hasta el patio de la casa del sumo sacerdote Caifás",
            "Fue corriendo delante de los soldados hasta el templo de Belén",
            "Se quedó esperando en el monte Sinaí junto a Juan el Bautista",
            "Regresó inmediatamente a su barca en Capernaúm"
        ],
        correct: "Lo siguió de lejos hasta el patio de la casa del sumo sacerdote Caifás"
    },
    {
        q: "¿Quién reconoció e interrogó a Pedro por primera vez mientras se calentaba junto al fuego?",
        opts: [
            "Una criada del sumo sacerdote que lo vio sentado a la luz de la fogata",
            "El gobernador romano Poncio Pilato",
            "Un centurión romano en la puerta de la ciudad",
            "Nicodemo, miembro del concilio"
        ],
        correct: "Una criada del sumo sacerdote que lo vio sentado a la luz de la fogata"
    },
    {
        q: "¿Por qué detalle reconocieron a Pedro la tercera vez los que estaban en el patio?",
        opts: [
            "Por su manera de hablar y su acento de Galilea, y un pariente de Malco lo identificó",
            "Porque llevaba escrita una inscripción en su manto",
            "Porque portaba las redes de pesca en sus manos",
            "Porque él mismo anunció su nombre en voz alta"
        ],
        correct: "Por su manera de hablar y su acento de Galilea, y un pariente de Malco lo identificó"
    },
    {
        q: "¿Qué ocurrió inmediatamente después de que Pedro negó por tercera vez conocer a Jesús?",
        opts: [
            "Cantó el gallo y el Señor se volvió y miró a Pedro",
            "Se produjo un eclipse sobre toda la región de Judea",
            "Las puertas del patio se cerraron por completo",
            "Los soldados liberaron a los demás discípulos"
        ],
        correct: "Cantó el gallo y el Señor se volvió y miró a Pedro"
    },
    {
        q: "¿Cómo reaccionó Pedro al recordar las palabras de Jesús cuando escuchó cantar al gallo y vio la mirada del Señor?",
        opts: [
            "Salió afuera y lloró amargamente con profundo arrepentimiento",
            "Se quedó dormido junto a la fogata del patio",
            "Entró a discutir con los guardias del sumo sacerdote",
            "Negó que el gallo hubiera cantado aquella madrugada"
        ],
        correct: "Salió afuera y lloró amargamente con profundo arrepentimiento"
    },
    {
        q: "Después de resucitar, ¿cómo restauró Jesús a Pedro junto al mar de Galilea (Juan 21)?",
        opts: [
            "Le preguntó tres veces «¿Me amas?» junto al fuego y le encomendó: «Apacienta mis ovejas»",
            "Le pidió que escribiera tres cartas antes de volver a Jerusalén",
            "Lo envió a construir un templo en la orilla del lago",
            "Le entregó una corona frente a todos los pescadores"
        ],
        correct: "Le preguntó tres veces «¿Me amas?» junto al fuego y le encomendó: «Apacienta mis ovejas»"
    },
    {
        q: "¿Qué enseñanza fundamental nos deja lo que pasó en la negación y restauración de Pedro?",
        opts: [
            "Que no debemos confiar solo en nuestras fuerzas, y que el amor de Jesús restaura a quien se arrepiente de corazón",
            "Que los discípulos nunca enfrentaron momentos de temor o debilidad",
            "Que la fe depende únicamente de la valentía humana sin necesidad de oración",
            "Que un error impide para siempre servir a Dios y a los demás"
        ],
        correct: "Que no debemos confiar solo en nuestras fuerzas, y que el amor de Jesús restaura a quien se arrepiente de corazón"
    }
];

async function seedNegacionDePedro() {
    await connectionPromise;

    let cristianismoSub = await Subject.findOne({ name: { $regex: /^cristianismo$/i } });
    if (!cristianismoSub) {
        cristianismoSub = await Subject.create({
            name: 'Cristianismo',
            description: 'Enseñanzas bíblicas, valores cristianos, historia de la fe y vida de Jesús.'
        });
        console.log(' Materia creada: Cristianismo');
    }

    // Quitar asignaciones de aula para Cristianismo (Cristianismo no lleva aula asignada)
    await CourseAssignment.deleteMany({ subject_id: cristianismoSub.id });

    let act = await Activity.findOne({ title: { $regex: /^la negaci[oó]n de pedro$/i } });
    if (!act) {
        act = await Activity.create({
            title: 'La negación de Pedro',
            type: 'Taller',
            theme: 'Clase Bíblica General',
            group_id: null,
            target_groups: [],
            subject_id: cristianismoSub.id,
            subject_name: 'Cristianismo',
            is_training_level: false,
            map_icon: '✝️'
        });
        console.log(`✅ Creada clase para proyectar "La negación de Pedro" sin asignación de aula (ID: ${act.id})`);
    } else {
        act.subject_id = cristianismoSub.id;
        act.subject_name = 'Cristianismo';
        act.theme = 'Clase Bíblica General';
        act.group_id = null;
        act.target_groups = [];
        act.map_icon = '✝️';
        await act.save();
    }

    await Question.deleteMany({ activity_id: act.id });

    for (let i = 0; i < negacionPedroQuestions.length; i++) {
        const item = negacionPedroQuestions[i];
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

    console.log(`✅ Clase y preguntas listas para "La negación de Pedro" (Sin asignación de aula, Materia: Cristianismo)`);
}

if (require.main === module) {
    seedNegacionDePedro().then(() => {
        process.exit(0);
    }).catch(err => {
        console.error('Error al sembrar La negación de Pedro:', err);
        process.exit(1);
    });
}

module.exports = seedNegacionDePedro;
