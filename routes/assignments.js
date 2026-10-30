const express = require('express');
const { CourseAssignment, Group, Subject, Teacher } = require('../models/database');
const router = express.Router();

// Listar asignaciones con datos poblados (Curso, Materia, Docente)
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.teacher_id) filter.teacher_id = Number(req.query.teacher_id);
        if (req.query.group_id) filter.group_id = Number(req.query.group_id);
        if (req.query.subject_id) filter.subject_id = Number(req.query.subject_id);

        const assignments = await CourseAssignment.find(filter).sort({ id: -1 });

        const [groups, subjects, teachers] = await Promise.all([
            Group.find({}, 'id name code'),
            Subject.find({}, 'id name'),
            Teacher.find({}, 'id full_name username')
        ]);

        const groupMap = new Map(groups.map(g => [g.id, g]));
        const subjectMap = new Map(subjects.map(s => [s.id, s]));
        const teacherMap = new Map(teachers.map(t => [t.id, t]));

        const enriched = assignments.map(a => {
            const grp = groupMap.get(a.group_id);
            const sub = subjectMap.get(a.subject_id);
            const tch = teacherMap.get(a.teacher_id);
            return {
                id: a.id,
                _id: a._id,
                group_id: a.group_id,
                group_name: grp ? grp.name : `Aula #${a.group_id}`,
                subject_id: a.subject_id,
                subject_name: sub ? sub.name : `Materia #${a.subject_id}`,
                teacher_id: a.teacher_id,
                teacher_name: tch ? tch.full_name : `Docente #${a.teacher_id}`,
                created_at: a.created_at
            };
        });

        res.json(enriched);
    } catch (error) {
        console.error('Error al listar asignaciones:', error);
        res.status(500).json({ error: error.message });
    }
});

// Crear una asignación (Asignar Docente + Materia a un Curso)
router.post('/', async (req, res) => {
    try {
        const group_id = Number(req.body.group_id);
        const subject_id = Number(req.body.subject_id);
        const teacher_id = Number(req.body.teacher_id);

        if (!group_id || !subject_id || !teacher_id) {
            return res.status(400).json({ error: 'Aula, Materia y Docente son obligatorios' });
        }

        const [group, subject, teacher] = await Promise.all([
            Group.findOne({ id: group_id }),
            Subject.findOne({ id: subject_id }),
            Teacher.findOne({ id: teacher_id })
        ]);

        if (!group) return res.status(404).json({ error: 'Aula no encontrada' });
        if (!subject) return res.status(404).json({ error: 'Materia no encontrada' });
        if (!teacher) return res.status(404).json({ error: 'Docente no encontrado' });

        const existing = await CourseAssignment.findOne({ group_id, subject_id, teacher_id });
        if (existing) {
            return res.status(400).json({ error: 'Este docente ya está asignado a esa materia en esta aula' });
        }

        const assignment = await CourseAssignment.create({
            group_id,
            subject_id,
            teacher_id
        });

        res.json({
            success: true,
            assignment: {
                id: assignment.id,
                group_id,
                group_name: group.name,
                subject_id,
                subject_name: subject.name,
                teacher_id,
                teacher_name: teacher.full_name
            }
        });
    } catch (error) {
        console.error('Error al crear asignación:', error);
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una asignación
router.delete('/:id', async (req, res) => {
    try {
        const assignmentId = Number(req.params.id);
        const assignment = await CourseAssignment.findOne({ id: assignmentId });
        if (!assignment) {
            return res.status(404).json({ error: 'Asignación no encontrada' });
        }

        await CourseAssignment.deleteOne({ id: assignmentId });
        res.json({ success: true, message: 'Asignación eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar asignación:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

