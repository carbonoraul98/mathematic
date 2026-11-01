const express = require('express');
const { Group, Student, Attempt, CourseAssignment } = require('../models/database');
const router = express.Router();

// Generar código aleatorio de 5 caracteres alfanuméricos
function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Obtener todas las aulas (con cuenta de estudiantes y soporte de filtro por docente)
router.get('/', async (req, res) => {
    try {
        const { teacher_id } = req.query;
        let groups;
        if (teacher_id) {
            const assignments = await CourseAssignment.find({ teacher_id: Number(teacher_id) });
            const groupIds = assignments.map(a => a.group_id);
            const teacher = await Teacher.findOne({ id: Number(teacher_id) });
            const teacherName = teacher ? teacher.full_name : '';
            groups = await Group.find({
                $or: [
                    { id: { $in: groupIds } },
                    { teacher_name: teacherName }
                ]
            }).sort({ name: 1 });
        } else {
            groups = await Group.find().sort({ name: 1 });
        }

        const studentCounts = await Student.aggregate([
            { $group: { _id: "$group_id", count: { $sum: 1 } } }
        ]);
        
        const countMap = {};
        studentCounts.forEach(item => {
            countMap[item._id] = item.count;
        });

        const groupsWithCount = groups.map(g => ({
            ...g.toObject(),
            student_count: countMap[g.id] || 0
        }));

        res.json(groupsWithCount);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Crear una nueva aula
router.post('/', async (req, res) => {
    try {
        const { name, teacher_name } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Falta el nombre del aula' });
        }
        
        const code = generateCode();
        const newGroup = await Group.create({
            name,
            code,
            teacher_name: teacher_name || 'Sin asignar'
        });
        
        res.json({ success: true, group: newGroup });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un aula
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const group = isNaN(id) ? await Group.findOne({ name: id }) : await Group.findOne({ id: Number(id) });
        if (!group) {
            return res.status(404).json({ error: 'Aula no encontrada' });
        }
        
        await CourseAssignment.deleteMany({ group_id: group.id });
        await Student.deleteMany({ group_id: group.id });
        await Group.deleteOne({ id: group.id });
        
        res.json({ success: true, message: `Aula ${group.name} eliminada con éxito` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Resetear progreso de todos los estudiantes de un aula
router.post('/:id/reset', async (req, res) => {
    try {
        const { id } = req.params;
        const group = isNaN(id) ? await Group.findOne({ name: id }) : await Group.findOne({ id: Number(id) });
        if (!group) {
            return res.status(404).json({ error: 'Aula no encontrada' });
        }
        
        const students = await Student.find({ group_id: group.id });
        const studentIds = students.map(s => s.id);
        
        await Student.updateMany({ group_id: group.id }, { total_score: 0 });
        await Attempt.deleteMany({ student_id: { $in: studentIds } });
        
        res.json({ success: true, message: `Progreso de aula ${group.name} reiniciado a 0` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
