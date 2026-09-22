const express = require('express');
const db = require('../models/database');
const router = express.Router();

// Crear actividad simple (sin preguntas, tipo Quiz/Actividad/Refuerzo)
router.post('/', async (req, res) => {
    try {
        const { title, type, theme, grade } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: 'El título es requerido' });
        }
        
        const insertActivity = await db.prepare(
            'INSERT INTO activities (title, type, theme) VALUES (?, ?, ?)'
        );
        const result = await insertActivity.run(title, type || 'Actividad', theme || `Grado ${grade || 'General'}`);
        
        res.json({ 
            success: true, 
            activity_id: result.lastInsertRowid,
            title: title
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Listar todas las actividades
router.get('/', async (req, res) => {
    try {
        const stmt = await db.prepare(
            'SELECT * FROM activities ORDER BY created_at DESC'
        );
        const activities = await stmt.all();
        res.json(activities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Editar una actividad
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, type, theme } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: 'El título es requerido' });
        }
        
        const updateActivity = await db.prepare(
            'UPDATE activities SET title = ?, type = ?, theme = ? WHERE id = ?'
        );
        const result = await updateActivity.run(title, type, theme, id);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Actividad no encontrada' });
        }
        
        res.json({ success: true, message: 'Actividad actualizada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una actividad
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const deleteActivity = await db.prepare(
            'DELETE FROM activities WHERE id = ?'
        );
        const result = await deleteActivity.run(id);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Actividad no encontrada' });
        }
        
        res.json({ success: true, message: 'Actividad eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
