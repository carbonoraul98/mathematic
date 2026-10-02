const express = require('express');
const { Student, Group, Attempt, Activity } = require('../models/database');
const router = express.Router();

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

// Login de estudiante
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const student = await Student.findOne({ username, password });

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

        const student = await Student.findOne({ id: Number(id) });
        
        if (!student) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }

        const newScore = (student.total_score || 0) + parseInt(xp);
        student.total_score = newScore;
        await student.save();
        
        // Registrar intento para historial y rendimiento
        if (req.body.activity_id) {
            await Attempt.create({
                student_id: Number(id),
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
        await Student.updateOne({ id: Number(id) }, { total_score: 0 });
        await Attempt.deleteMany({ student_id: Number(id) });
        
        res.json({ success: true, message: 'Progreso reiniciado a 0' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener intentos de un estudiante
router.get('/:id/attempts', async (req, res) => {
    try {
        const { id } = req.params;
        const attempts = await Attempt.find({ student_id: Number(id) }).sort({ completed_at: -1 });
        
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
        const student = await Student.findOne({ id: Number(id) });
        if (!student) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }

        const group = await Group.findOne({ id: student.group_id });
        const attempts = await Attempt.find({ student_id: Number(id) }).sort({ completed_at: -1 });

        // Calcular racha (días activos)
        const daysSet = new Set(attempts.map(a => new Date(a.completed_at).toISOString().split('T')[0]));
        const streakDays = Math.max(1, daysSet.size || (student.total_score > 0 ? 1 : 1));

        // Categorías de temas
        const categories = [
            {
                name: 'Suma y resta',
                icon: '➕',
                color: '#10b981', // Verde
                bg: 'rgba(16, 185, 129, 0.15)',
                keywords: ['suma', 'resta']
            },
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

        const allActivities = await Activity.find();
        const actMap = {};
        allActivities.forEach(a => { actMap[a.id] = a; });

        const studentLevel = Math.floor((student.total_score || 0) / 30) + 1;

        const topicPerformance = categories.map((cat, idx) => {
            const matchedActs = allActivities.filter(a => {
                const title = (a.title || '').toLowerCase();
                const theme = (a.theme || '').toLowerCase();
                return cat.keywords.some(k => title.includes(k) || theme.includes(k));
            });
            const matchedIds = matchedActs.map(a => a.id);
            const catAttempts = attempts.filter(att => matchedIds.includes(att.activity_id));

            let percentage = 0;
            if (catAttempts.length > 0) {
                const totalScore = catAttempts.reduce((acc, curr) => acc + curr.score, 0);
                percentage = Math.min(100, Math.round((totalScore / (catAttempts.length * 20)) * 100));
            } else {
                // Cálculo proporcional basado en nivel de XP alcanzado
                if (idx === 0) {
                    percentage = student.total_score > 0 ? Math.min(95, 30 + Math.round((student.total_score / 30) * 35)) : 15;
                } else if (idx === 1) {
                    percentage = studentLevel >= 2 ? Math.min(85, 25 + (studentLevel - 1) * 20) : (student.total_score > 15 ? 20 : 5);
                } else if (idx === 2) {
                    percentage = studentLevel >= 3 ? Math.min(80, 20 + (studentLevel - 2) * 20) : (studentLevel >= 2 ? 15 : 0);
                } else {
                    percentage = studentLevel >= 4 ? Math.min(75, 20 + (studentLevel - 3) * 20) : (studentLevel >= 3 ? 10 : 0);
                }
            }

            return {
                name: cat.name,
                icon: cat.icon,
                color: cat.color,
                bg: cat.bg,
                percentage: Math.max(0, Math.min(100, percentage)),
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

