const express = require('express');
const { Activity, Question } = require('../models/database');
const router = express.Router();

// Cargar examen JSON unificado
router.post('/', async (req, res) => {
    try {
        const { title, grade, questions: examQuestions } = req.body;
        
        if (!title || !examQuestions || !Array.isArray(examQuestions)) {
            return res.status(400).json({ error: 'Faltan datos requeridos (title, questions)' });
        }
        
        // Crear actividad/examen
        const activity = await Activity.create({
            title,
            type: 'Examen',
            theme: `Grado ${grade || 'General'}`
        });
        
        for (let i = 0; i < examQuestions.length; i++) {
            const q = examQuestions[i];
            
            let options = [];
            let correctAnswer = '0';
            
            if (q.opciones && Array.isArray(q.opciones)) {
                options = q.opciones.map(opt => opt.texto || opt.text || opt);
                
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
                options = q.options;
                correctAnswer = (q.correct !== undefined ? q.correct : q.correcta !== undefined ? q.correcta : 0).toString();
            }
            
            await Question.create({
                activity_id: activity.id,
                question_text: q.pregunta || q.question || q.text || 'Sin pregunta',
                question_type: 'multiple_choice',
                options: JSON.stringify(options),
                correct_answer: correctAnswer,
                points: q.points || q.puntos || 10,
                order_num: i
            });
        }
        
        res.json({ 
            success: true, 
            activity_id: activity.id, 
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
        const activities = await Activity.find().sort({ created_at: -1 });
        res.json(activities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener preguntas de un examen
router.get('/:activityId/questions', async (req, res) => {
    try {
        const questions = await Question.find({ activity_id: Number(req.params.activityId) }).sort({ order_num: 1 });
        
        const formatted = questions.map(q => {
            const qObj = q.toObject();
            if (qObj.options) {
                try {
                    qObj.options = JSON.parse(qObj.options);
                } catch(e) {
                    qObj.options = [];
                }
            } else {
                qObj.options = [];
            }
            return qObj;
        });
        
        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
