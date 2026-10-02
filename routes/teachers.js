const express = require('express');
const { Teacher } = require('../models/database');
const router = express.Router();

// Login de profesor
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const teacher = await Teacher.findOne({ username, password });

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
