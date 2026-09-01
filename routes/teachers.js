const express = require('express');
const db = require('../models/database');
const router = express.Router();

// Login de profesor
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const stmt = await db.prepare(
            'SELECT * FROM teachers WHERE username = ? AND password = ?'
        );
        const teacher = await stmt.get(username, password);

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
