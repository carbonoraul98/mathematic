const express = require('express');
const { Activity, Question } = require('../models/database');
const router = express.Router();

// Crear actividad (con preguntas opcionales)
router.post('/', async (req, res) => {
    try {
        const { title, type, theme, grade, questions } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: 'El título es requerido' });
        }
        
        const activity = await Activity.create({
            title,
            type: type || 'Actividad',
            theme: theme || `Grado ${grade || 'General'}`
        });
        
        // Guardar las preguntas si vienen en el body
        if (questions && Array.isArray(questions) && questions.length > 0) {
            let order = 0;
            for (let q of questions) {
                const options = JSON.stringify([q.a || "", q.b || "", q.c || ""]);
                await Question.create({
                    activity_id: activity.id,
                    question_text: q.pregunta || q.question || '',
                    question_type: q.tipo || 'opcion',
                    options,
                    correct_answer: q.correcta || "",
                    order_num: order++
                });
            }
        }
        
        res.json({ 
            success: true, 
            activity_id: activity.id,
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
        const activities = await Activity.find().sort({ created_at: -1 });
        const allQuestions = await Question.find().sort({ order_num: 1 });
        
        const activitiesWithQuestions = activities.map(act => {
            const actQuestions = allQuestions.filter(q => q.activity_id === act.id);
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
                ...act.toObject(),
                preguntas: formattedQuestions,
                tema: act.theme || act.title
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
        
        const result = await Activity.updateOne(
            { id: Number(id) },
            { $set: { title, type, theme } }
        );
        
        if (result.matchedCount === 0) {
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
        
        const result = await Activity.deleteOne({ id: Number(id) });
        await Question.deleteMany({ activity_id: Number(id) });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Actividad no encontrada' });
        }
        
        res.json({ success: true, message: 'Actividad eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
