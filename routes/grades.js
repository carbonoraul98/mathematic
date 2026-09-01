const express = require('express');
const xlsx = require('xlsx');
const db = require('../models/database');
const router = express.Router();

router.get('/export', async (req, res) => {
    try {
        const groupId = req.query.groupId;

        let query = `
            SELECT s.list_number, s.full_name, s.username, COALESCE(SUM(a.score), 0) as total_score
            FROM students s
            LEFT JOIN attempts a ON s.id = a.student_id
        `;

        if (groupId) {
            query += ' WHERE s.group_id = ?';
        }

        query += ' GROUP BY s.id ORDER BY s.list_number';

        const stmt = await db.prepare(query);
        const rows = groupId 
            ? await stmt.all(groupId)
            : await stmt.all();

        const exportData = rows.map(r => ({
            'N°': r.list_number,
            'NOMBRES Y APELLIDOS': r.full_name,
            'USUARIO': r.username,
            'PUNTAJE TOTAL': r.total_score
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
