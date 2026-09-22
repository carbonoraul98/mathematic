const express = require('express');
const db = require('../models/database');
const router = express.Router();

// Generate a random 5-character alphanumeric code
function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Obtener todas las aulas (con cuenta de estudiantes)
router.get('/', async (req, res) => {
    try {
        const stmt = await db.prepare(`
            SELECT g.*, COUNT(s.id) as student_count
            FROM groups g
            LEFT JOIN students s ON s.group_id = g.id
            GROUP BY g.id
            ORDER BY g.name
        `);
        const groups = await stmt.all();
        res.json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Crear una nueva aula
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Falta el nombre del aula' });
        }
        
        const code = generateCode();
        
        const insertGroup = await db.prepare('INSERT INTO groups (name, code, teacher_name) VALUES (?, ?, ?)');
        const result = await insertGroup.run(name, code, 'Jorge Pajon'); // TODO: Obtener del auth en un futuro
        
        const newGroupStmt = await db.prepare('SELECT * FROM groups WHERE id = ?');
        const newGroup = await newGroupStmt.get(result.lastInsertRowid);
        
        res.json({ success: true, group: newGroup });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
