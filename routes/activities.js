const express = require('express');
const { Activity, Question, Attempt, Student, Group } = require('../models/database');
const router = express.Router();

// Crear actividad (con preguntas opcionales y asignación de aulas)
router.post('/', async (req, res) => {
    try {
        const { title, type, theme, grade, questions, group_id, target_groups, is_training_level, training_grade, map_icon } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: 'El título es requerido' });
        }

        let targets = [];
        if (Array.isArray(target_groups) && target_groups.length > 0) {
            targets = target_groups.map(Number);
        } else if (group_id) {
            targets = [Number(group_id)];
        }
        
        const primaryGroupId = group_id ? Number(group_id) : (targets[0] || null);

        const activity = await Activity.create({
            title,
            type: type || 'Actividad',
            theme: theme || `Grado ${grade || 'General'}`,
            group_id: primaryGroupId,
            target_groups: targets,
            is_training_level: Boolean(is_training_level),
            training_grade: training_grade ? String(training_grade) : (grade ? String(grade) : ''),
            map_icon: map_icon || (type === 'Examen' ? '📝' : '🏆')
        });
        
        // Guardar las preguntas si vienen en el body
        if (questions && Array.isArray(questions) && questions.length > 0) {
            let order = 0;
            for (let q of questions) {
                const options = JSON.stringify([q.a || "", q.b || "", q.c || "", q.d || ""]);
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
            title: title,
            group_id: activity.group_id,
            target_groups: activity.target_groups
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Listar actividades (soporta filtro opcional ?groupId=)
router.get('/', async (req, res) => {
    try {
        const { groupId } = req.query;
        let queryFilter = {};
        if (groupId) {
            const gid = Number(groupId);
            queryFilter = {
                $or: [
                    { group_id: gid },
                    { target_groups: gid },
                    { group_id: null },
                    { group_id: { $exists: false } }
                ]
            };
        }

        const activities = await Activity.find(queryFilter).sort({ created_at: -1 });
        const allQuestions = await Question.find().sort({ order_num: 1 });
        const allGroups = await Group.find();
        const groupMap = {};
        allGroups.forEach(g => { groupMap[g.id] = g.name; });
        
        const activitiesWithQuestions = activities.map(act => {
            const actQuestions = allQuestions.filter(q => q.activity_id === act.id);
            const formattedQuestions = actQuestions.map(q => {
                let options = [];
                try { options = JSON.parse(q.options) || []; } catch(e) {}
                
                return {
                    id: q.id,
                    pregunta: q.question_text,
                    tipo: q.question_type,
                    a: options[0] || "",
                    b: options[1] || "",
                    c: options[2] || "",
                    d: options[3] || "",
                    correcta: q.correct_answer
                };
            });

            const targetNames = (act.target_groups || []).map(gid => groupMap[gid] || `Aula ${gid}`);
            const primaryGroupName = act.group_id ? (groupMap[act.group_id] || `Aula ${act.group_id}`) : null;
            
            return {
                ...act.toObject(),
                preguntas: formattedQuestions,
                tema: act.theme || act.title,
                primary_group_name: primaryGroupName,
                target_group_names: targetNames
            };
        });
        
        res.json(activitiesWithQuestions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener una actividad por ID con sus preguntas
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const act = await Activity.findOne({ id: Number(id) });
        if (!act) {
            return res.status(404).json({ error: 'Actividad no encontrada' });
        }

        const questions = await Question.find({ activity_id: Number(id) }).sort({ order_num: 1 });
        const formattedQuestions = questions.map(q => {
            let options = [];
            try { options = JSON.parse(q.options) || []; } catch(e) {}
            return {
                id: q.id,
                pregunta: q.question_text,
                tipo: q.question_type,
                a: options[0] || "",
                b: options[1] || "",
                c: options[2] || "",
                d: options[3] || "",
                correcta: q.correct_answer
            };
        });

        res.json({
            ...act.toObject(),
            preguntas: formattedQuestions,
            tema: act.theme || act.title
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener entregas / intentos de estudiantes para esta actividad
router.get('/:id/attempts', async (req, res) => {
    try {
        const { id } = req.params;
        const attempts = await Attempt.find({ activity_id: Number(id) }).sort({ completed_at: -1 });
        const studentIds = [...new Set(attempts.map(a => a.student_id))];
        const students = await Student.find({ id: { $in: studentIds } });
        const studentMap = {};
        students.forEach(s => {
            studentMap[s.id] = s;
        });

        const detailedAttempts = attempts.map(att => {
            const st = studentMap[att.student_id] || {};
            return {
                id: att.id,
                student_id: att.student_id,
                student_name: st.full_name || ('Estudiante #' + att.student_id),
                username: st.username || '',
                group_id: st.group_id,
                score: att.score,
                completed_at: att.completed_at
            };
        });

        res.json({ success: true, attempts: detailedAttempts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Eliminar / reiniciar un intento específico de un estudiante
router.delete('/:id/attempts/:attemptId', async (req, res) => {
    try {
        const { attemptId } = req.params;
        const attempt = await Attempt.findOne({ id: Number(attemptId) });
        if (attempt) {
            // Descontar puntaje del estudiante si corresponde
            await Student.updateOne(
                { id: attempt.student_id },
                { $inc: { total_score: -attempt.score } }
            );
            await Attempt.deleteOne({ id: Number(attemptId) });
        }
        res.json({ success: true, message: 'Intento reiniciado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Editar una actividad
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, type, theme, group_id, target_groups, is_training_level, training_grade, map_icon } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: 'El título es requerido' });
        }

        const updateData = { title, type, theme };
        if (group_id !== undefined) {
            updateData.group_id = group_id ? Number(group_id) : null;
        }
        if (target_groups !== undefined) {
            updateData.target_groups = Array.isArray(target_groups) ? target_groups.map(Number) : [];
        }
        if (is_training_level !== undefined) {
            updateData.is_training_level = Boolean(is_training_level);
        }
        if (training_grade !== undefined) {
            updateData.training_grade = String(training_grade);
        }
        if (map_icon !== undefined) {
            updateData.map_icon = String(map_icon);
        }
        
        const result = await Activity.updateOne(
            { id: Number(id) },
            { $set: updateData }
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

// Actualizar una pregunta específica de una actividad
router.put('/:id/questions/:questionId', async (req, res) => {
    try {
        const { id, questionId } = req.params;
        const { pregunta, tipo, a, b, c, d, correcta } = req.body;
        
        const options = JSON.stringify([a || "", b || "", c || "", d || ""]);
        const result = await Question.updateOne(
            { id: Number(questionId), activity_id: Number(id) },
            {
                $set: {
                    question_text: pregunta,
                    question_type: tipo || 'opcion',
                    options,
                    correct_answer: correcta
                }
            }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, error: 'Pregunta no encontrada' });
        }
        
        res.json({ success: true, message: 'Pregunta actualizada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Agregar una nueva pregunta a una actividad existente
router.post('/:id/questions', async (req, res) => {
    try {
        const { id } = req.params;
        const { pregunta, tipo, a, b, c, d, correcta } = req.body;
        
        const count = await Question.countDocuments({ activity_id: Number(id) });
        const options = JSON.stringify([a || "", b || "", c || "", d || ""]);
        const newQ = await Question.create({
            activity_id: Number(id),
            question_text: pregunta || 'Nueva pregunta',
            question_type: tipo || 'opcion',
            options,
            correct_answer: correcta || a || '',
            order_num: count
        });
        
        res.json({ success: true, question: newQ });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Eliminar una pregunta de una actividad
router.delete('/:id/questions/:questionId', async (req, res) => {
    try {
        const { id, questionId } = req.params;
        await Question.deleteOne({ id: Number(questionId), activity_id: Number(id) });
        res.json({ success: true, message: 'Pregunta eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
