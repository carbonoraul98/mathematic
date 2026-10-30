const express = require('express');
const { Teacher } = require('../models/database');
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
            const teacherData = matchedTeacher.toObject ? matchedTeacher.toObject() : { ...matchedTeacher };
            delete teacherData.password;
            res.json({ success: true, teacher: teacherData });
        } else {
            res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
        }
    } catch (error) {
        console.error('Error en teacher login:', error);
        res.status(500).json({ error: error.message });
    }
});

// Listar todos los docentes (para el Super Admin)
router.get('/', async (req, res) => {
    try {
        const teachers = await Teacher.find({}, '-password').sort({ full_name: 1 });
        res.json(teachers);
    } catch (error) {
        console.error('Error al listar docentes:', error);
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo docente (por el Super Admin)
router.post('/', async (req, res) => {
    try {
        const { full_name, username, password, role } = req.body;
        if (!full_name || !username || !password) {
            return res.status(400).json({ error: 'Nombre, usuario y contraseña son requeridos' });
        }

        const cleanUsername = clean(username);
        const existing = await Teacher.findOne({
            username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') }
        });

        if (existing) {
            return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
        }

        const isSuper = role === 'superadmin';
        const newTeacher = await Teacher.create({
            full_name: full_name.trim(),
            username: username.trim(),
            password: String(password).trim(),
            role: isSuper ? 'superadmin' : 'docente',
            is_admin: isSuper
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
        const { full_name, username, password, role } = req.body;

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
        if (role) {
            teacher.role = role === 'superadmin' ? 'superadmin' : 'docente';
            teacher.is_admin = teacher.role === 'superadmin';
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
