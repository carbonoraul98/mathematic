const express = require('express');
const multer = require('multer');
const db = require('../models/database');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// Cargar examen JSON unificado
router.post('/', async (req, res) => {
    try {
        const { title, grade, questions: examQuestions } = req.body;
        
        if (!title || !examQuestions || !Array.isArray(examQuestions)) {
            return res.status(400).json({ error: 'Faltan datos requeridos (title, questions)' });
        }
        
        // Crear actividad/examen
        const insertActivity = await db.prepare(
            'INSERT INTO activities (title, type, theme) VALUES (?, ?, ?)'
        );
        const activityResult = await insertActivity.run(title, 'Examen', `Grado ${grade || 'General'}`);
        const activityId = activityResult.lastInsertRowid;
        
        // Insertar preguntas
        const insertQuestion = await db.prepare(
            'INSERT INTO questions (activity_id, question_text, question_type, options, correct_answer, points, order_num) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        
        for (let i = 0; i < examQuestions.length; i++) {
            const q = examQuestions[i];
            
            // Convertir opciones al formato esperado
            let options = [];
            let correctAnswer = '0';
            
            if (q.opciones && Array.isArray(q.opciones)) {
                // Formato nuevo: array de objetos {letra, texto}
                options = q.opciones.map(opt => opt.texto || opt.text || opt);
                
                // Encontrar índice de la respuesta correcta por letra
                if (q.respuesta_correcta) {
                    const correctLetter = q.respuesta_correcta.toUpperCase();
                    const correctIndex = q.opciones.findIndex(opt => 
                        (opt.letra || '').toUpperCase() === correctLetter
                    );
                    if (correctIndex !== -1) {
                        correctAnswer = correctIndex.toString();
                    }
                }
            } else if (q.options && Array.isArray(q.options)) {
                // Formato antiguo: array de strings
                options = q.options;
                correctAnswer = (q.correct !== undefined ? q.correct : q.correcta !== undefined ? q.correcta : 0).toString();
            }
            
            await insertQuestion.run(
                activityId,
                q.pregunta || q.question || q.text || 'Sin pregunta',
                'multiple_choice',
                JSON.stringify(options),
                correctAnswer,
                q.points || q.puntos || 10,
                i
            );
        }
        
        res.json({ 
            success: true, 
            activity_id: activityId, 
            questions_count: examQuestions.length,
            title: title
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Listar todas las actividades/exámenes
router.get('/', async (req, res) => {
    try {
        const stmt = await db.prepare(
            'SELECT * FROM activities ORDER BY created_at DESC'
        );
        const activities = await stmt.all();
        res.json(activities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener preguntas de un examen
router.get('/:activityId/questions', async (req, res) => {
    try {
        const stmt = await db.prepare(
            'SELECT * FROM questions WHERE activity_id = ? ORDER BY order_num'
        );
        const questions = await stmt.all(req.params.activityId);
        
        // Parsear opciones JSON
        questions.forEach(q => {
            if (q.options) {
                try {
                    q.options = JSON.parse(q.options);
                } catch(e) {
                    q.options = [];
                }
            }
        });
        
        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
