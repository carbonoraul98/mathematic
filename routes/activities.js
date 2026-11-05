const express = require('express');
const { Activity, Question, Attempt, Student, Group, Teacher, CourseAssignment, Subject } = require('../models/database');
const router = express.Router();

function cleanStr(str) {
    return String(str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

async function checkTeacherCanModifyActivity(act, req) {
    const rawTeacherId = req.body?.requester_teacher_id ?? req.query?.requester_teacher_id ?? req.headers?.['x-teacher-id'];
    if (rawTeacherId === undefined || rawTeacherId === null || rawTeacherId === '') {
        if (act.teacher_id || act.subject_name || act.subject_id) {
            return { allowed: false, error: '⛔ Solo el docente titular de la materia o el Super Admin (superU) pueden modificar esta evaluación.' };
        }
        return { allowed: true };
    }

    const teacherId = Number(rawTeacherId);
    if (!teacherId) {
        return { allowed: false, error: '⛔ Docente no identificado.' };
    }

    const teacher = await Teacher.findOne({ id: teacherId });
    if (!teacher) {
        return { allowed: false, error: '⛔ Docente no encontrado.' };
    }

    // 1. El Super Admin (superU) siempre puede modificar cualquier actividad/examen
    if (cleanStr(teacher.username) === 'superu') {
        return { allowed: true };
    }

    // 2. Obtener las asignaciones académicas del docente
    const [assignments, subjects] = await Promise.all([
        CourseAssignment.find({ teacher_id: teacher.id }),
        Subject.find({})
    ]);
    const subjectNameMap = new Map(subjects.map(s => [s.id, cleanStr(s.name)]));
    const teacherSubjects = new Set(assignments.map(a => subjectNameMap.get(a.subject_id)).filter(Boolean));

    const actSubject = cleanStr(act.subject_name || '');
    const actGroups = (Array.isArray(act.target_groups) && act.target_groups.length > 0)
        ? act.target_groups.map(Number)
        : (act.group_id ? [Number(act.group_id)] : []);

    const teachesSubjectInCourse = actSubject
        ? assignments.some(a => {
            const subName = subjectNameMap.get(a.subject_id);
            if (subName !== actSubject) return false;
            if (actGroups.length === 0) return true;
            return actGroups.includes(Number(a.group_id));
        })
        : false;

    const isCreator = Boolean(act.teacher_id && Number(act.teacher_id) === Number(teacher.id));

    if (actSubject) {
        if (teachesSubjectInCourse || (isCreator && (teacherSubjects.has(actSubject) || assignments.length === 0))) {
            return { allowed: true };
        }
        return {
            allowed: false,
            error: `⛔ Acceso denegado: solo el profesor de ${act.subject_name} o el Super Admin (superU) pueden modificar esta evaluación.`
        };
    }

    if (act.teacher_id) {
        if (isCreator) {
            return { allowed: true };
        }
        return {
            allowed: false,
            error: '⛔ Acceso denegado: solo el profesor creador de esta evaluación o el Super Admin (superU) pueden modificarla.'
        };
    }

    const teachesMath = assignments.some(a => {
        const subName = subjectNameMap.get(a.subject_id);
        if (subName !== 'matematicas') return false;
        if (actGroups.length === 0) return true;
        return actGroups.includes(Number(a.group_id));
    });
    if (teachesMath) {
        return { allowed: true };
    }

    return {
        allowed: false,
        error: '⛔ Acceso denegado: solo el profesor de la materia correspondiente o el Super Admin (superU) pueden modificar esta evaluación.'
    };
}

// Crear actividad (con preguntas opcionales y asignación de aulas)
router.post('/', async (req, res) => {
    try {
        const { title, type, theme, grade, questions, group_id, target_groups, is_training_level, training_grade, map_icon, subject_id, subject_name, teacher_id, teacher_name } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: 'El título es requerido' });
        }

        let targets = [];
        if (Array.isArray(target_groups) && target_groups.length > 0) {
            targets = target_groups.map(Number);
        } else if (group_id) {
            targets = [Number(group_id)];
        } else if (grade && (String(grade) === '4' || String(grade) === '5')) {
            const gradeGroups = await Group.find({ name: { $regex: new RegExp(`^${grade}`) } });
            targets = gradeGroups.map(g => g.id);
        }
        
        const primaryGroupId = group_id ? Number(group_id) : (targets[0] || null);
        let resolvedSubjectId = subject_id ? Number(subject_id) : null;
        const resolvedSubjectName = subject_name ? String(subject_name).trim() : '';
        if (!resolvedSubjectId && resolvedSubjectName) {
            const foundSub = await Subject.findOne({ name: { $regex: new RegExp(`^${resolvedSubjectName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
            if (foundSub) resolvedSubjectId = foundSub.id;
        }

        const activity = await Activity.create({
            title,
            type: type || 'Actividad',
            theme: theme || `Grado ${grade || 'General'}`,
            group_id: primaryGroupId,
            target_groups: targets,
            subject_id: resolvedSubjectId,
            subject_name: resolvedSubjectName,
            teacher_id: teacher_id ? Number(teacher_id) : null,
            teacher_name: teacher_name ? String(teacher_name).trim() : '',
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
            const studentGroup = await Group.findOne({ id: gid });
            const studentGrade = studentGroup && studentGroup.name ? studentGroup.name.charAt(0) : null;

            queryFilter = {
                $or: [
                    { group_id: gid },
                    { target_groups: gid }
                ]
            };

            if (studentGrade) {
                // Actividades globales de su grado (si no tienen aulas explícitas)
                queryFilter.$or.push({
                    $and: [
                        { $or: [{ target_groups: { $size: 0 } }, { target_groups: { $exists: false } }] },
                        { $or: [{ group_id: null }, { group_id: { $exists: false } }] },
                        { $or: [
                            { theme: { $regex: new RegExp(`Grado\\s*${studentGrade}`, 'i') } },
                            { training_grade: studentGrade }
                        ]}
                    ]
                });
            } else {
                queryFilter.$or.push({ group_id: null }, { group_id: { $exists: false } });
            }
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
        const { id, attemptId } = req.params;
        const act = await Activity.findOne({ id: Number(id) });
        if (!act) {
            return res.status(404).json({ success: false, error: 'Actividad no encontrada' });
        }

        const auth = await checkTeacherCanModifyActivity(act, req);
        if (!auth.allowed) {
            return res.status(403).json({ success: false, error: auth.error });
        }

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
        const { title, type, theme, group_id, target_groups, is_training_level, training_grade, map_icon, subject_name } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: 'El título es requerido' });
        }

        const existingAct = await Activity.findOne({ id: Number(id) });
        if (!existingAct) {
            return res.status(404).json({ error: 'Actividad no encontrada' });
        }

        const auth = await checkTeacherCanModifyActivity(existingAct, req);
        if (!auth.allowed) {
            return res.status(403).json({ success: false, error: auth.error });
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
        if (subject_name !== undefined && String(subject_name).trim()) {
            updateData.subject_name = String(subject_name).trim();
        }
        
        await Activity.updateOne(
            { id: Number(id) },
            { $set: updateData }
        );
        
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
        const existingAct = await Activity.findOne({ id: Number(id) });
        if (!existingAct) {
            return res.status(404).json({ error: 'Actividad no encontrada' });
        }

        const auth = await checkTeacherCanModifyActivity(existingAct, req);
        if (!auth.allowed) {
            return res.status(403).json({ success: false, error: auth.error });
        }
        
        await Activity.deleteOne({ id: Number(id) });
        await Question.deleteMany({ activity_id: Number(id) });
        
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
        const existingAct = await Activity.findOne({ id: Number(id) });
        if (!existingAct) {
            return res.status(404).json({ success: false, error: 'Actividad no encontrada' });
        }

        const auth = await checkTeacherCanModifyActivity(existingAct, req);
        if (!auth.allowed) {
            return res.status(403).json({ success: false, error: auth.error });
        }

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
        const existingAct = await Activity.findOne({ id: Number(id) });
        if (!existingAct) {
            return res.status(404).json({ success: false, error: 'Actividad no encontrada' });
        }

        const auth = await checkTeacherCanModifyActivity(existingAct, req);
        if (!auth.allowed) {
            return res.status(403).json({ success: false, error: auth.error });
        }

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
        const existingAct = await Activity.findOne({ id: Number(id) });
        if (!existingAct) {
            return res.status(404).json({ success: false, error: 'Actividad no encontrada' });
        }

        const auth = await checkTeacherCanModifyActivity(existingAct, req);
        if (!auth.allowed) {
            return res.status(403).json({ success: false, error: auth.error });
        }

        await Question.deleteOne({ id: Number(questionId), activity_id: Number(id) });
        res.json({ success: true, message: 'Pregunta eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
