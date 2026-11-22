const { connectionPromise, Activity, Question, Group, Subject, CourseAssignment } = require('./models/database');

const negacionPedroQuestions = [
    {
        q: "Según Juan 13:36-37 (NTV), cuando Simón Pedro le preguntó «Señor, ¿adónde vas?», ¿qué le contestó Jesús antes de que Pedro dijera que estaba dispuesto a morir por Él?",
        opts: [
            "«Ahora no puedes venir conmigo, pero me seguirás después»",
            "«Ven conmigo ahora mismo al palacio del gobernador»",
            "«Ya no volveremos a vernos en Galilea»",
            "«Debes quedarte en el templo con los fariseos»"
        ],
        correct: "«Ahora no puedes venir conmigo, pero me seguirás después»"
    },
    {
        q: "En Mateo 26:31 (NTV) y Marcos 14:27 (NTV), Jesús sabía de antemano que todos lo abandonarían aquella noche. ¿Qué profecía de las Escrituras citó el Señor?",
        opts: [
            "«Dios golpeará al Pastor, y las ovejas del rebaño se dispersarán»",
            "«El Pastor reunirá a todos los reyes de la tierra en Jerusalén»",
            "«Las ovejas nunca tendrán temor en medio de la noche»",
            "«Ninguno de mis seguidores tropezará jamás»"
        ],
        correct: "«Dios golpeará al Pastor, y las ovejas del rebaño se dispersarán»"
    },
    {
        q: "A pesar de saber que lo abandonarían y que Pedro lo negaría, ¿qué promesa de esperanza les dio Jesús por adelantado en Mateo 26:32 y Marcos 14:28 (NTV)?",
        opts: [
            "«Sin embargo, después de ser levantado de los muertos, iré delante de ustedes a Galilea y allí los veré»",
            "«No permitiré que ningún soldado entre al huerto de Getsemaní»",
            "«Les enviaré doce legiones de ángeles para evitar el arresto»",
            "«Me quedaré oculto en Betania durante cuarenta días»"
        ],
        correct: "«Sin embargo, después de ser levantado de los muertos, iré delante de ustedes a Galilea y allí los veré»"
    },
    {
        q: "¿Cómo reaccionaron Pedro y los demás discípulos en Mateo 26:33-35 (NTV) cuando Jesús les advirtió lo que iba a suceder?",
        opts: [
            "Pedro insistió: «¡No! Aunque tenga que morir contigo, ¡jamás te negaré!», y los demás discípulos juraron lo mismo",
            "Reconocieron humildemente su debilidad y pidieron perdón en ese instante",
            "Guardaron silencio y decidieron no acompañar a Jesús al monte de los Olivos",
            "Dijeron que preferían regresar a sus casas antes de que llegara la noche"
        ],
        correct: "Pedro insistió: «¡No! Aunque tenga que morir contigo, ¡jamás te negaré!», y los demás discípulos juraron lo mismo"
    },
    {
        q: "Según el relato de Marcos 14:30 (NTV), ¿qué detalle específico mencionó Jesús en su predicción a Pedro?",
        opts: [
            "«Esta misma noche, antes de que cante el gallo dos veces, negarás tres veces que me conoces»",
            "«Mañana al mediodía me negarás frente a Poncio Pilato»",
            "«Antes de que salga el sol me negarás siete veces en el templo»",
            "«Me negarás cuando estés navegando en el mar de Galilea»"
        ],
        correct: "«Esta misma noche, antes de que cante el gallo dos veces, negarás tres veces que me conoces»"
    },
    {
        q: "Según Lucas 22:54-55 (NTV), cuando arrestaron a Jesús y lo llevaron a la casa del sumo sacerdote, ¿qué hizo Pedro?",
        opts: [
            "Los siguió de lejos y luego se sumó al grupo de guardias que se sentaron alrededor de una fogata en medio del patio",
            "Entró junto a Jesús a la sala del juicio para defenderlo públicamente",
            "Huyó inmediatamente fuera de Jerusalén hacia el río Jordán",
            "Se escondió dentro del aposento alto con las puertas cerradas"
        ],
        correct: "Los siguió de lejos y luego se sumó al grupo de guardias que se sentaron alrededor de una fogata en medio del patio"
    },
    {
        q: "En Lucas 22:56-57 (NTV), ¿cómo ocurrió la primera negación de Pedro?",
        opts: [
            "Una sirvienta lo vio a la luz de la fogata, lo miró fijamente y dijo: «Este hombre era uno de los seguidores de Jesús», pero Pedro negó: «¡Mujer, ni siquiera lo conozco!»",
            "El sumo sacerdote le preguntó su nombre en la puerta del templo",
            "Un soldado romano le quitó su manto en el camino a Getsemaní",
            "Sus propios compañeros lo señalaron frente a la multitud"
        ],
        correct: "Una sirvienta lo vio a la luz de la fogata, lo miró fijamente y dijo: «Este hombre era uno de los seguidores de Jesús», pero Pedro negó: «¡Mujer, ni siquiera lo conozco!»"
    },
    {
        q: "Según Lucas 22:59-60 (NTV), alrededor de una hora más tarde, ¿por qué razón insistió otra persona en que Pedro era seguidor de Jesús, y qué sucedió mientras Pedro aún hablaba?",
        opts: [
            "Insistió porque Pedro también era galileo; Pedro dijo «¡Hombre, no sé de qué hablas!» e inmediatamente, mientras aún hablaba, el gallo cantó",
            "Lo reconocieron por sus sandalias y en ese momento comenzó a llover",
            "Lo identificaron porque llevaba un rollo de las Escrituras en la mano",
            "Lo reconocieron porque cantaba un salmo junto a la fogata"
        ],
        correct: "Insistió porque Pedro también era galileo; Pedro dijo «¡Hombre, no sé de qué hablas!» e inmediatamente, mientras aún hablaba, el gallo cantó"
    },
    {
        q: "Según Lucas 22:61-62 (NTV), ¿qué hizo el Señor apenas cantó el gallo y qué pasó en el corazón de Pedro?",
        opts: [
            "El Señor se volvió y miró a Pedro; las palabras de Jesús pasaron rápidamente por su mente y Pedro salió del patio llorando amargamente",
            "El Señor le dio la espalda y Pedro se quedó sentado junto a la fogata",
            "Pedro intentó justificarse delante de los guardias del patio",
            "Los soldados expulsaron a Pedro del patio sin que él pudiera ver a Jesús"
        ],
        correct: "El Señor se volvió y miró a Pedro; las palabras de Jesús pasaron rápidamente por su mente y Pedro salió del patio llorando amargamente"
    },
    {
        q: "En la restauración de Pedro en el mismo Evangelio de Juan (Juan 21:9-17 NTV), ¿con qué recibió Jesús resucitado a sus discípulos en la playa de Galilea y qué le preguntó tres veces a Pedro?",
        opts: [
            "Los recibió con una fogata de brasas, pescado y pan, y le preguntó tres veces «Simón, hijo de Jonás, ¿me amas?», encargándole: «Alimenta a mis ovejas»",
            "Los recibió en el templo de Jerusalén y le pidió que repitiera sus promesas de la Última Cena",
            "Le quitó el ministerio de apóstol por haberlo negado tres veces en el patio",
            "Le pidió que permaneciera pescando en Galilea sin predicar el evangelio"
        ],
        correct: "Los recibió con una fogata de brasas, pescado y pan, y le preguntó tres veces «Simón, hijo de Jonás, ¿me amas?», encargándole: «Alimenta a mis ovejas»"
    },
    {
        q: "¿Cómo se conecta la promesa que Jesús le dio a Pedro antes de su caída en Juan 13:36 («Ahora no puedes venir conmigo, pero me seguirás después») con el cierre de su restauración en Juan 21:19 (NTV)?",
        opts: [
            "Se cumple cuando Jesús, después de perdonarlo y restaurarlo junto al mar de Galilea, vuelve a llamarlo diciéndole: «¡Sígueme!»",
            "No tienen relación porque Juan 21 trata únicamente sobre la pesca en el lago",
            "Significaba que Pedro nunca más podría servir como discípulo de Jesús",
            "Se refería únicamente a caminar hacia el monte de los Olivos aquella noche"
        ],
        correct: "Se cumple cuando Jesús, después de perdonarlo y restaurarlo junto al mar de Galilea, vuelve a llamarlo diciéndole: «¡Sígueme!»"
    },
    {
        q: "El Señor sabía de antemano todo lo que pasaría para que Pedro llegara a negarlo (la autoconfianza, la falta de oración en Getsemaní y seguirlo de lejos). ¿Qué nos enseña esto cuando nosotros también fallamos?",
        opts: [
            "Que a veces somos como Pedro al confiar en nuestras fuerzas y flaquear ante el temor, pero Jesús ya nos conoce, nos mira con amor y nos restaura cuando nos arrepentimos de corazón",
            "Que solo los discípulos del primer siglo podían equivocarse y hoy nadie pasa por pruebas de fe",
            "Que basta con hacer grandes promesas verbales sin necesidad de orar ni depender de Dios",
            "Que cuando una persona falla una vez, Dios ya no vuelve a darle otra oportunidad"
        ],
        correct: "Que a veces somos como Pedro al confiar en nuestras fuerzas y flaquear ante el temor, pero Jesús ya nos conoce, nos mira con amor y nos restaura cuando nos arrepentimos de corazón"
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
            theme: 'Clase Bíblica General (NTV)',
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
        act.theme = 'Clase Bíblica General (NTV)';
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

    console.log(`✅ Clase y preguntas (NTV) listas para "La negación de Pedro" (Sin asignación de aula, Materia: Cristianismo)`);
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
