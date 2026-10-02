const express = require('express');
const xlsx = require('xlsx');
const { Student, Attempt } = require('../models/database');
const router = express.Router();

router.get('/export', async (req, res) => {
    try {
        const groupId = req.query.groupId;
        const filter = groupId ? { group_id: Number(groupId) } : {};
        
        const students = await Student.find(filter).sort({ list_number: 1 });
        const studentIds = students.map(s => s.id);
        
        const attemptSums = await Attempt.aggregate([
            { $match: { student_id: { $in: studentIds } } },
            { $group: { _id: "$student_id", total: { $sum: "$score" } } }
        ]);
        
        const scoreMap = {};
        attemptSums.forEach(item => {
            scoreMap[item._id] = item.total;
        });

        const exportData = students.map(s => ({
            'N°': s.list_number,
            'NOMBRES Y APELLIDOS': s.full_name,
            'USUARIO': s.username,
            'PUNTAJE TOTAL': scoreMap[s.id] !== undefined ? scoreMap[s.id] : (s.total_score || 0)
        }));

        const worksheet = xlsx.utils.json_to_sheet(exportData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Calificaciones');

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=calificaciones.xlsx');
        res.send(buffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
