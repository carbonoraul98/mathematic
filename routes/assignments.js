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

// Crear una asignación (Individual o para Todas las Aulas)
router.post('/', async (req, res) => {
    try {
        const { group_id, subject_id, teacher_id, all_groups } = req.body;
        const subId = Number(subject_id);
        const tchId = Number(teacher_id);

        if (!subId || !tchId) {
            return res.status(400).json({ error: 'Materia y Docente son obligatorios' });
        }

        const [subject, teacher] = await Promise.all([
            Subject.findOne({ id: subId }),
            Teacher.findOne({ id: tchId })
        ]);

        if (!subject) return res.status(404).json({ error: 'Materia no encontrada' });
        if (!teacher) return res.status(404).json({ error: 'Docente no encontrado' });

        // Caso: Asignar a TODAS las aulas
        if (group_id === 'all' || all_groups === true) {
            const allClassrooms = await Group.find({});
            if (allClassrooms.length === 0) {
                return res.status(400).json({ error: 'No hay aulas registradas en el sistema' });
            }

            let createdCount = 0;
            for (const grp of allClassrooms) {
                const existing = await CourseAssignment.findOne({ group_id: grp.id, subject_id: subId });
                if (existing) {
                    if (existing.teacher_id !== tchId) {
                        existing.teacher_id = tchId;
                        await existing.save();
                        createdCount++;
                    }
                } else {
                    await CourseAssignment.create({
                        group_id: grp.id,
                        subject_id: subId,
                        teacher_id: tchId
                    });
                    createdCount++;
                }
            }

            return res.json({
                success: true,
                is_mass_assignment: true,
                message: `Se asignó la materia "${subject.name}" con el docente "${teacher.full_name}" a ${createdCount} aula(s).`,
                count: createdCount
            });
        }

        // Caso: Asignar a un aula individual
        const grpId = Number(group_id);
        if (!grpId) {
            return res.status(400).json({ error: 'Debes seleccionar un aula válida' });
        }

        const group = await Group.findOne({ id: grpId });
        if (!group) return res.status(404).json({ error: 'Aula no encontrada' });

        const existing = await CourseAssignment.findOne({ group_id: grpId, subject_id: subId });
        if (existing) {
            if (existing.teacher_id === tchId) {
                return res.status(400).json({ error: 'Este docente ya está asignado a esa materia en esta aula' });
            }
            existing.teacher_id = tchId;
            await existing.save();
            return res.json({
                success: true,
                assignment: {
                    id: existing.id,
                    group_id: grpId,
                    group_name: group.name,
                    subject_id: subId,
                    subject_name: subject.name,
                    teacher_id: tchId,
                    teacher_name: teacher.full_name
                }
            });
        }

        const assignment = await CourseAssignment.create({
            group_id: grpId,
            subject_id: subId,
            teacher_id: tchId
        });

        res.json({
            success: true,
            assignment: {
                id: assignment.id,
                group_id: grpId,
                group_name: group.name,
                subject_id: subId,
                subject_name: subject.name,
                teacher_id: tchId,
                teacher_name: teacher.full_name
            }
        });
    } catch (error) {
        console.error('Error al crear asignación:', error);
        res.status(500).json({ error: error.message });
    }
});

// Actualizar / Modificar una asignación
router.put('/:id', async (req, res) => {
    try {
        const assignmentId = Number(req.params.id);
        const { group_id, subject_id, teacher_id } = req.body;

        const assignment = await CourseAssignment.findOne({ id: assignmentId });
        if (!assignment) {
            return res.status(404).json({ error: 'Asignación no encontrada' });
        }

        const newSubjectId = subject_id ? Number(subject_id) : assignment.subject_id;
        const newTeacherId = teacher_id ? Number(teacher_id) : assignment.teacher_id;

        const [subject, teacher] = await Promise.all([
            Subject.findOne({ id: newSubjectId }),
            Teacher.findOne({ id: newTeacherId })
        ]);

        if (!subject) return res.status(404).json({ error: 'Materia no encontrada' });
        if (!teacher) return res.status(404).json({ error: 'Docente no encontrado' });

        // Si se seleccionó "Todas las aulas" en la modificación
        if (group_id === 'all') {
            const allClassrooms = await Group.find({});
            if (allClassrooms.length === 0) {
                return res.status(400).json({ error: 'No hay aulas registradas en el sistema' });
            }

            let affected = 0;
            for (const grp of allClassrooms) {
                const existing = await CourseAssignment.findOne({ group_id: grp.id, subject_id: newSubjectId });
                if (existing) {
                    existing.teacher_id = newTeacherId;
                    await existing.save();
                    affected++;
                } else {
                    await CourseAssignment.create({
                        group_id: grp.id,
                        subject_id: newSubjectId,
                        teacher_id: newTeacherId
                    });
                    affected++;
                }
            }

            return res.json({
                success: true,
                is_mass_assignment: true,
                message: `Se aplicó la materia "${subject.name}" con el docente "${teacher.full_name}" a todas las ${allClassrooms.length} aulas.`
            });
        }

        // Modificación a un aula individual
        const newGroupId = group_id ? Number(group_id) : assignment.group_id;
        const group = await Group.findOne({ id: newGroupId });
        if (!group) return res.status(404).json({ error: 'Aula no encontrada' });

        // Verificar colisión con otra asignación existente
        const conflict = await CourseAssignment.findOne({
            id: { $ne: assignmentId },
            group_id: newGroupId,
            subject_id: newSubjectId,
            teacher_id: newTeacherId
        });

        if (conflict) {
            return res.status(400).json({ error: 'Ya existe una asignación idéntica para esa aula, materia y docente' });
        }

        assignment.group_id = newGroupId;
        assignment.subject_id = newSubjectId;
        assignment.teacher_id = newTeacherId;
        await assignment.save();

        res.json({
            success: true,
            assignment: {
                id: assignment.id,
                group_id: newGroupId,
                group_name: group.name,
                subject_id: newSubjectId,
                subject_name: subject.name,
                teacher_id: newTeacherId,
                teacher_name: teacher.full_name
            }
        });
    } catch (error) {
        console.error('Error al actualizar asignación:', error);
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

