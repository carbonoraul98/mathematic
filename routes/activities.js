const express = require('express');
const db = require('../models/database');
const router = express.Router();

// Crear actividad (con preguntas opcionales)
router.post('/', async (req, res) => {
    try {
        const { title, type, theme, grade, questions } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: 'El título es requerido' });
        }
        
        const insertActivity = await db.prepare(
            'INSERT INTO activities (title, type, theme) VALUES (?, ?, ?)'
        );
        const result = await insertActivity.run(title, type || 'Actividad', theme || `Grado ${grade || 'General'}`);
        const activityId = result.lastInsertRowid;
        
        // Guardar las preguntas si vienen en el body
        if (questions && Array.isArray(questions) && questions.length > 0) {
            const insertQuestion = await db.prepare(
                'INSERT INTO questions (activity_id, question_text, question_type, options, correct_answer) VALUES (?, ?, ?, ?, ?)'
            );
            
            for (let q of questions) {
                const options = JSON.stringify([q.a || "", q.b || "", q.c || ""]);
                await insertQuestion.run(
                    activityId,
                    q.pregunta,
                    q.tipo || 'opcion',
                    options,
                    q.correcta || ""
                );
            }
        }
        
        res.json({ 
            success: true, 
            activity_id: activityId,
            title: title
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Listar todas las actividades
router.get('/', async (req, res) => {
    try {
        const stmt = await db.prepare(
            'SELECT * FROM activities ORDER BY created_at DESC'
        );
        const activities = await stmt.all();
        
        // Fetch questions for all activities
        const qStmt = await db.prepare('SELECT * FROM questions');
        const allQuestions = await qStmt.all();
        
        // Map questions to activities
        const activitiesWithQuestions = activities.map(act => {
            const actQuestions = allQuestions.filter(q => q.activity_id === act.id);
            // Formatear las preguntas al formato esperado por el frontend
            const formattedQuestions = actQuestions.map(q => {
                let options = [];
                try { options = JSON.parse(q.options) || []; } catch(e) {}
                
                return {
                    pregunta: q.question_text,
                    tipo: q.question_type,
                    a: options[0] || "",
                    b: options[1] || "",
                    c: options[2] || "",
                    correcta: q.correct_answer
                };
            });
            
            return {
                ...act,
                preguntas: formattedQuestions,
                tema: act.theme || act.title // frontend uses tema
            };
        });
        
        res.json(activitiesWithQuestions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Editar una actividad
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, type, theme } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: 'El título es requerido' });
        }
        
        const updateActivity = await db.prepare(
            'UPDATE activities SET title = ?, type = ?, theme = ? WHERE id = ?'
        );
        const result = await updateActivity.run(title, type, theme, id);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Actividad no encontrada' });
        }
        
        res.json({ success: true, message: 'Actividad actualizada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una actividad
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const deleteActivity = await db.prepare(
            'DELETE FROM activities WHERE id = ?'
        );
        const result = await deleteActivity.run(id);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Actividad no encontrada' });
        }
        
        res.json({ success: true, message: 'Actividad eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
