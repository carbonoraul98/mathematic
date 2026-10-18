const express = require('express');
const mongoose = require('mongoose');
const { Student, Group, Attempt, Activity, Question } = require('../models/database');
const router = express.Router();

async function findStudentById(id) {
    if (id === undefined || id === null) return null;
    const numId = Number(id);
    const filter = !isNaN(numId)
        ? { $or: [{ id: numId }, { _id: mongoose.Types.ObjectId.isValid(id) ? id : null }] }
        : (mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id: -1 });
    return await Student.findOne(filter);
}

// Función para calcular el nivel basado en el total_score (XP)
function calculateLevel(total_score) {
    const xpPerLevel = 30;
    const score = total_score || 0;
    const currentLevel = Math.floor(score / xpPerLevel) + 1;
    const currentXP = score % xpPerLevel;
    const progressPercent = Math.round((currentXP / xpPerLevel) * 100);
    
    return {
        level: currentLevel,
        currentXP,
        xpPerLevel,
        progressPercent
    };
}

// Crear estudiante individual
router.post('/', async (req, res) => {
    try {
        const { grado, nombre, usuario, password } = req.body;
        
        if (!nombre || !usuario || !grado) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }
        
        // Insertar grupo si no existe
        let group = await Group.findOne({ name: grado });
        if (!group) {
            group = await Group.create({ name: grado, teacher_name: '' });
        }
        
        // Determinar un list_number único
        let list_number = parseInt(usuario);
        if (isNaN(list_number)) {
            const lastStudent = await Student.findOne({ group_id: group.id }).sort({ list_number: -1 });
            list_number = (lastStudent && lastStudent.list_number !== null) ? lastStudent.list_number + 1 : 1;
        } else {
            let exists = await Student.findOne({ group_id: group.id, list_number });
            while (exists) {
                list_number++;
                exists = await Student.findOne({ group_id: group.id, list_number });
            }
        }
        
        // Insertar estudiante
        const newStudent = await Student.create({
            group_id: group.id,
            list_number,
            full_name: nombre,
            username: usuario,
            password: password || '1234'
        });
        
        res.json({ success: true, student_id: newStudent.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Listar estudiantes
router.get('/', async (req, res) => {
    try {
        const students = await Student.find().sort({ group_id: 1, list_number: 1 });
        const groups = await Group.find();
        const groupMap = {};
        groups.forEach(g => {
            groupMap[g.id] = g.name;
        });
        
        // Agregar info de nivel y group_name
        const studentsWithLevels = students.map(s => {
            const sObj = s.toObject();
            return {
                ...sObj,
                group_name: groupMap[s.group_id] || '',
                levelInfo: calculateLevel(s.total_score)
            };
        });
        
        res.json(studentsWithLevels);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// Login de estudiante
router.post('/login', async (req, res) => {
    try {
        const username = String(req.body.username || '').trim();
        const password = String(req.body.password || '').trim();

        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Usuario y contraseña requeridos' });
        }

        const safeUserRegex = new RegExp(`^${escapeRegex(username)}$`, 'i');
        const student = await Student.findOne({
            username: safeUserRegex,
            password: password
        });

        if (student) {
            const group = await Group.findOne({ id: student.group_id });
            const studentObj = student.toObject();
            studentObj.group_name = group ? group.name : '';
            studentObj.levelInfo = calculateLevel(student.total_score);
            res.json({ success: true, student: studentObj });
        } else {
            res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Añadir XP (puntos de práctica) a un estudiante
router.post('/:id/add-xp', async (req, res) => {
    try {
        const { id } = req.params;
        const { xp } = req.body;
        
        if (!xp || isNaN(xp)) {
            return res.status(400).json({ error: 'XP válido es requerido' });
        }

        const student = await findStudentById(id);
        
        if (!student) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }

        const newScore = (student.total_score || 0) + parseInt(xp);
        student.total_score = newScore;
        await student.save();
        
        // Registrar intento para historial y rendimiento
        if (req.body.activity_id) {
            await Attempt.create({
                student_id: student.id,
                activity_id: Number(req.body.activity_id),
                score: parseInt(xp)
            });
        }
        
        const newLevelInfo = calculateLevel(newScore);
        
        res.json({ 
            success: true, 
            total_score: newScore,
            levelInfo: newLevelInfo
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Resetear progreso (volver a 0)
router.post('/:id/reset', async (req, res) => {
    try {
        const { id } = req.params;
        const student = await findStudentById(id);

        if (!student) {
            return res.status(404).json({ success: false, error: 'Estudiante no encontrado' });
        }

        student.total_score = 0;
        await student.save();

        const numId = Number(id);
        const studentId = student.id;
        const deleteConditions = [{ student_id: studentId }];
        if (!isNaN(numId) && numId !== studentId) {
            deleteConditions.push({ student_id: numId });
        }

        await Attempt.deleteMany({ $or: deleteConditions });
        
        res.json({ 
            success: true, 
            message: 'Progreso reiniciado a 0',
            total_score: 0,
            levelInfo: calculateLevel(0)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Obtener intentos de un estudiante
router.get('/:id/attempts', async (req, res) => {
    try {
        const { id } = req.params;
        const student = await findStudentById(id);
        const studentId = student ? student.id : (isNaN(Number(id)) ? -1 : Number(id));
        const attempts = await Attempt.find({ student_id: studentId }).sort({ completed_at: -1 });
        
        const activityIds = [...new Set(attempts.map(a => a.activity_id))];
        const activities = await Activity.find({ id: { $in: activityIds } });
        const actMap = {};
        activities.forEach(act => {
            actMap[act.id] = act;
        });

        const formattedAttempts = attempts.map(a => {
            const act = actMap[a.activity_id] || {};
            return {
                ...a.toObject(),
                title: act.title || 'Actividad',
                type: act.type || 'General',
                theme: act.theme || ''
            };
        });

        res.json({ success: true, attempts: formattedAttempts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener métricas de rendimiento y progreso para la vista de perfil del estudiante
router.get('/:id/performance', async (req, res) => {
    try {
        const { id } = req.params;
        const student = await findStudentById(id);
        if (!student) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }

        const group = await Group.findOne({ id: student.group_id });
        const attempts = await Attempt.find({ student_id: student.id }).sort({ completed_at: -1 });

        // Calcular racha (días activos)
        const daysSet = new Set(attempts.map(a => new Date(a.completed_at).toISOString().split('T')[0]));
        const streakDays = attempts.length > 0 ? daysSet.size : (student.total_score > 0 ? 1 : 0);

        // Categorías de temas alineadas al currículo oficial
        const isGrade5 = group && group.name && String(group.name).startsWith('5');
        const categories = [
            {
                name: 'Multiplicación',
                icon: '✖️',
                color: '#06b6d4', // Cyan
                bg: 'rgba(6, 182, 212, 0.15)',
                keywords: ['multiplicación', 'multiplicacion']
            },
            {
                name: 'División',
                icon: '➗',
                color: '#ec4899', // Rosa
                bg: 'rgba(236, 72, 153, 0.15)',
                keywords: ['división', 'division']
            },
            {
                name: 'Fracciones',
                icon: '🥧',
                color: '#f59e0b', // Naranja
                bg: 'rgba(245, 158, 11, 0.15)',
                keywords: ['fracción', 'fraccion', 'fracciones', 'decimal']
            }
        ];

        if (isGrade5) {
            categories.push({
                name: 'Operaciones Mixtas',
                icon: '⚡',
                color: '#10b981', // Verde esmeralda
                bg: 'rgba(16, 185, 129, 0.15)',
                keywords: ['mixta', 'mixtas', 'orden', 'combinada', 'combinadas']
            });
            categories.push({
                name: 'Plano y Álgebra',
                icon: '📍',
                color: '#8b5cf6', // Violeta
                bg: 'rgba(139, 92, 246, 0.15)',
                keywords: ['plano', 'cartesiano', 'estadística', 'estadistica', 'álgebra', 'algebra']
            });
        }

        const allActivities = await Activity.find();
        const actMap = {};
        allActivities.forEach(a => { actMap[a.id] = a; });

        const allQuestions = await Question.find();
        const actQuestionCounts = {};
        allQuestions.forEach(q => {
            actQuestionCounts[q.activity_id] = (actQuestionCounts[q.activity_id] || 0) + 1;
        });

        const topicPerformance = categories.map((cat) => {
            const matchedActs = allActivities.filter(a => {
                const title = (a.title || '').toLowerCase();
                const theme = (a.theme || '').toLowerCase();
                return cat.keywords.some(k => title.includes(k) || theme.includes(k));
            });
            const matchedIds = matchedActs.map(a => a.id);
            const catAttempts = attempts.filter(att => matchedIds.includes(att.activity_id));

            let percentage = 0;
            let totalPointsEarned = 0;
            let totalPointsPossible = 0;

            if (catAttempts.length > 0) {
                catAttempts.forEach(att => {
                    const qCount = actQuestionCounts[att.activity_id] || 5;
                    totalPointsEarned += (att.score || 0);
                    totalPointsPossible += (qCount * 10);
                });

                if (totalPointsPossible > 0) {
                    percentage = Math.round((totalPointsEarned / totalPointsPossible) * 100);
                    percentage = Math.min(100, Math.max(0, percentage));
                }
            } else {
                percentage = 0;
            }

            return {
                name: cat.name,
                icon: cat.icon,
                color: cat.color,
                bg: cat.bg,
                percentage: percentage,
                attemptsCount: catAttempts.length
            };
        });

        res.json({
            success: true,
            student: {
                id: student.id,
                full_name: student.full_name,
                username: student.username,
                group_name: group ? group.name : '',
                total_score: student.total_score || 0,
                levelInfo: calculateLevel(student.total_score)
            },
            streakDays,
            topics: topicPerformance
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

