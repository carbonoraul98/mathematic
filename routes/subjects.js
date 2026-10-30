const express = require('express');
const { Subject, CourseAssignment } = require('../models/database');
const router = express.Router();

// Listar todas las materias
router.get('/', async (req, res) => {
    try {
        const subjects = await Subject.find().sort({ name: 1 });
        res.json(subjects);
    } catch (error) {
        console.error('Error al listar materias:', error);
        res.status(500).json({ error: error.message });
    }
});

// Crear una nueva materia
router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'El nombre de la materia es requerido' });
        }

        const trimmedName = name.trim();
        const existing = await Subject.findOne({
            name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
        });

        if (existing) {
            return res.status(400).json({ error: 'Ya existe una materia con ese nombre' });
        }

        const newSubject = await Subject.create({
            name: trimmedName,
            description: (description || '').trim()
        });

        res.json({ success: true, subject: newSubject });
    } catch (error) {
        console.error('Error al crear materia:', error);
        res.status(500).json({ error: error.message });
    }
});

// Actualizar materia
router.put('/:id', async (req, res) => {
    try {
        const subjectId = Number(req.params.id);
        const { name, description } = req.body;

        const subject = await Subject.findOne({ id: subjectId });
        if (!subject) {
            return res.status(404).json({ error: 'Materia no encontrada' });
        }

        if (name && name.trim()) {
            const trimmedName = name.trim();
            const conflict = await Subject.findOne({
                id: { $ne: subjectId },
                name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
            });
            if (conflict) {
                return res.status(400).json({ error: 'Ya existe otra materia con ese nombre' });
            }
            subject.name = trimmedName;
        }

        if (description !== undefined) {
            subject.description = String(description).trim();
        }

        await subject.save();
        res.json({ success: true, subject });
    } catch (error) {
        console.error('Error al actualizar materia:', error);
        res.status(500).json({ error: error.message });
    }
});

// Eliminar materia
router.delete('/:id', async (req, res) => {
    try {
        const subjectId = Number(req.params.id);
        const subject = await Subject.findOne({ id: subjectId });
        if (!subject) {
            return res.status(404).json({ error: 'Materia no encontrada' });
        }

        // Eliminar también las asignaciones asociadas a esta materia
        await CourseAssignment.deleteMany({ subject_id: subjectId });
        await Subject.deleteOne({ id: subjectId });

        res.json({ success: true, message: 'Materia eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar materia:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

