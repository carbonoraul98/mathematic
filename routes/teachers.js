const express = require('express');
const { Teacher, CourseAssignment, Group, Subject } = require('../models/database');
const router = express.Router();

function clean(str) {
    return String(str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

// Login de profesor (Insensible a mayúsculas, tildes, espacios y alias comunes)
router.post('/login', async (req, res) => {
    try {
        const rawUser = String(req.body.username || '').trim();
        const rawPass = String(req.body.password || '').trim();

        if (!rawUser || !rawPass) {
            return res.status(400).json({ success: false, error: 'Usuario y contraseña requeridos' });
        }

        const cleanUser = clean(rawUser);
        const cleanUserNoSpaces = cleanUser.replace(/\s+/g, '');

        // Aliases comunes para profesor/administrador
        const teacherAliases = ['admin', 'jorge', 'pajon', 'jorgepajon', 'profesor', 'profe'];

        const teachers = await Teacher.find({});
        const matchedTeacher = teachers.find(t => {
            const tUser = clean(t.username);
            const tFull = clean(t.full_name);
            const tUserNoSpaces = tUser.replace(/\s+/g, '');
            const tFullNoSpaces = tFull.replace(/\s+/g, '');

            const userMatches = 
                tUser === cleanUser || 
                tFull === cleanUser || 
                tUserNoSpaces === cleanUserNoSpaces ||
                tFullNoSpaces === cleanUserNoSpaces ||
                (t.is_admin && teacherAliases.includes(cleanUserNoSpaces));

            if (!userMatches) return false;

            // Verificación de contraseña exacta (sin fallback 123/1234)
            return t.password === rawPass;
        });

        if (matchedTeacher) {
            const isSuperU = clean(matchedTeacher.username) === 'superu';
            const teacherData = matchedTeacher.toObject ? matchedTeacher.toObject() : { ...matchedTeacher };
            teacherData.role = isSuperU ? 'superadmin' : 'docente';
            teacherData.is_admin = isSuperU;
            delete teacherData.password;

            const [assignments, groups, subjects] = await Promise.all([
                CourseAssignment.find({ teacher_id: matchedTeacher.id }),
                Group.find({}, 'id name'),
                Subject.find({}, 'id name')
            ]);
            const groupMap = new Map(groups.map(g => [g.id, g.name]));
            const subjectMap = new Map(subjects.map(s => [s.id, s.name]));

            teacherData.assignments = assignments.map(a => ({
                assignment_id: a.id,
                group_id: a.group_id,
                group_name: groupMap.get(a.group_id) || '',
                subject_id: a.subject_id,
                subject_name: subjectMap.get(a.subject_id) || ''
            }));
            teacherData.assigned_subjects = [...new Set(teacherData.assignments.map(a => a.subject_name).filter(Boolean))];

            res.json({ success: true, teacher: teacherData });
        } else {
            res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
        }
    } catch (error) {
        console.error('Error en teacher login:', error);
        res.status(500).json({ error: error.message });
    }
});

// Listar todos los docentes (para el Super Admin) enriquecido con sus cursos y materias
router.get('/', async (req, res) => {
    try {
        const teachers = await Teacher.find({}, '-password').sort({ full_name: 1 });
        const teacherIds = teachers.map(t => t.id);

        const [assignments, groups, subjects] = await Promise.all([
            CourseAssignment.find({ teacher_id: { $in: teacherIds } }),
            Group.find({}, 'id name code'),
            Subject.find({}, 'id name description')
        ]);

        const groupMap = new Map(groups.map(g => [g.id, g.name]));
        const subjectMap = new Map(subjects.map(s => [s.id, s.name]));

        const assignmentMap = {};
        assignments.forEach(a => {
            if (!assignmentMap[a.teacher_id]) assignmentMap[a.teacher_id] = [];
            assignmentMap[a.teacher_id].push({
                assignment_id: a.id,
                group_id: a.group_id,
                group_name: groupMap.get(a.group_id) || `Aula #${a.group_id}`,
                subject_id: a.subject_id,
                subject_name: subjectMap.get(a.subject_id) || `Materia #${a.subject_id}`
            });
        });

        const enriched = teachers.map(t => {
            const tObj = t.toObject ? t.toObject() : { ...t };
            return {
                ...tObj,
                assignments: assignmentMap[t.id] || []
            };
        });

        res.json(enriched);
    } catch (error) {
        console.error('Error al listar docentes:', error);
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo docente (por el Super Admin - estrictamente rol docente)
router.post('/', async (req, res) => {
    try {
        const { full_name, username, password } = req.body;
        if (!full_name || !username || !password) {
            return res.status(400).json({ error: 'Nombre, usuario y contraseña son requeridos' });
        }

        const cleanUsername = clean(username);
        if (cleanUsername === 'superu') {
            return res.status(400).json({ error: 'No se puede crear otro usuario con el nombre superU' });
        }

        const existing = await Teacher.findOne({
            username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') }
        });

        if (existing) {
            return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
        }

        const newTeacher = await Teacher.create({
            full_name: full_name.trim(),
            username: username.trim(),
            password: String(password).trim(),
            role: 'docente',
            is_admin: false
        });

        const safeData = newTeacher.toObject();
        delete safeData.password;
        res.json({ success: true, teacher: safeData });
    } catch (error) {
        console.error('Error al crear docente:', error);
        res.status(500).json({ error: error.message });
    }
});

// Actualizar docente
router.put('/:id', async (req, res) => {
    try {
        const teacherId = Number(req.params.id);
        const { full_name, username, password } = req.body;

        const teacher = await Teacher.findOne({ id: teacherId });
        if (!teacher) {
            return res.status(404).json({ error: 'Docente no encontrado' });
        }

        if (full_name) teacher.full_name = full_name.trim();
        if (username) {
            const cleanUsername = clean(username);
            const conflict = await Teacher.findOne({
                id: { $ne: teacherId },
                username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') }
            });
            if (conflict) {
                return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
            }
            teacher.username = username.trim();
        }
        if (password && String(password).trim().length > 0) {
            teacher.password = String(password).trim();
        }

        // Ningún docente excepto superU puede ser superadmin ni admin
        if (clean(teacher.username) !== 'superu') {
            teacher.role = 'docente';
            teacher.is_admin = false;
        }

        await teacher.save();
        const safeData = teacher.toObject();
        delete safeData.password;
        res.json({ success: true, teacher: safeData });
    } catch (error) {
        console.error('Error al actualizar docente:', error);
        res.status(500).json({ error: error.message });
    }
});

// Eliminar docente
router.delete('/:id', async (req, res) => {
    try {
        const teacherId = Number(req.params.id);
        const teacher = await Teacher.findOne({ id: teacherId });
        if (!teacher) {
            return res.status(404).json({ error: 'Docente no encontrado' });
        }

        if (clean(teacher.username) === 'superu') {
            return res.status(400).json({ error: 'No se puede eliminar la cuenta principal de Super Usuario (superU)' });
        }

        await Teacher.deleteOne({ id: teacherId });
        res.json({ success: true, message: 'Docente eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar docente:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
