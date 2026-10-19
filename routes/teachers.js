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

            // Verificación de contraseña: exacta, o tolerar 1234 / 123 para administrador
            const passMatches = 
                t.password === rawPass ||
                (t.is_admin && (rawPass === '1234' || rawPass === '123'));

            return passMatches;
        });

        if (matchedTeacher) {
            res.json({ success: true, teacher: matchedTeacher });
        } else {
            res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
        }
    } catch (error) {
        console.error('Error en teacher login:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
