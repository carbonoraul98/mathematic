const express = require('express');
const { Teacher } = require('../models/database');
const router = express.Router();

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// Login de profesor
router.post('/login', async (req, res) => {
    try {
        const username = String(req.body.username || '').trim();
        const password = String(req.body.password || '').trim();

        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Usuario y contraseña requeridos' });
        }

        const safeUserRegex = new RegExp(`^${escapeRegex(username)}$`, 'i');
        
        // Permite login por username insensible a mayúsculas, o alias "admin" / "jorge"
        const teacher = await Teacher.findOne({
            $or: [
                { username: safeUserRegex },
                ...( ['admin', 'jorge'].includes(username.toLowerCase()) ? [{ is_admin: true }] : [] )
            ],
            password: password
        });

        if (teacher) {
            res.json({ success: true, teacher });
        } else {
            res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
