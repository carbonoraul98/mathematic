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

module.exports = router;
