const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const db = require('../models/database');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// Función para limpiar el nombre del grupo (4°A -> 4A)
function cleanGroupName(name) {
    return name.replace('°', '').trim();
}

// Subir Excel y crear estudiantes
router.post('/upload', upload.single('excel'), async (req, res) => {
    try {
        const workbook = xlsx.readFile(req.file.path);
        let totalCreated = 0;

        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });

            if (data.length < 3) continue;

            let currentGroupName = '';
            let currentTeacherName = '';
            let rowIndex = 0;

            while (rowIndex < data.length) {
                const row = data[rowIndex];
                
                // Detectar fila de grupo (tiene formato como 4°A, 5°B, etc.)
                if (row[1] && typeof row[1] === 'string' && /[45]°[ABC]/.test(row[1].trim())) {
                    currentGroupName = cleanGroupName(row[1].trim());
                    rowIndex++;
                    // Siguiente fila debería ser el docente
                    if (rowIndex < data.length && data[rowIndex][1]) {
                        currentTeacherName = data[rowIndex][1].toString().trim();
                        rowIndex++;
                    }
                    // Saltar fila de encabezados si existe
                    if (rowIndex < data.length && (data[rowIndex][0] === 'N°' || data[rowIndex][0] === 'n°')) {
                        rowIndex++;
                    }
                    continue;
                }

                // Detectar nuevo grupo por formato alternativo
                if (row[1] && !row[0] && typeof row[1] === 'string' && row[1].length > 3) {
                    // Verificar si es un nombre de grupo
                    const possibleGroup = row[1].trim();
                    if (/[45][°]?[ABC]/.test(possibleGroup)) {
                        currentGroupName = cleanGroupName(possibleGroup);
                        rowIndex++;
                        // Siguiente fila debería ser el docente
                        if (rowIndex < data.length && data[rowIndex][1]) {
                            currentTeacherName = data[rowIndex][1].toString().trim();
                            rowIndex++;
                        }
                        // Saltar fila de encabezados
                        if (rowIndex < data.length && (data[rowIndex][0] === 'N°' || data[rowIndex][0] === 'n°')) {
                            rowIndex++;
                        }
                        continue;
                    }
                }

                // Detectar fila de encabezados
                if (row[0] === 'N°' || row[0] === 'n°' || row[0] === 'NÂ°') {
                    rowIndex++;
                    continue;
                }

                // Procesar estudiante
                const listNumber = parseInt(row[0]);
                const fullName = row[1] ? row[1].toString().trim() : null;

                if (!listNumber || !fullName || !currentGroupName) {
                    rowIndex++;
                    continue;
                }

                // Insertar grupo si no existe
                const insertGroup = await db.prepare('INSERT OR IGNORE INTO groups (name, teacher_name) VALUES (?, ?)');
                await insertGroup.run(currentGroupName, currentTeacherName);

                const getGroup = await db.prepare('SELECT id FROM groups WHERE name = ?');
                const group = await getGroup.get(currentGroupName);

                // Insertar estudiante con grupo asignado
                const insertStudent = await db.prepare(
                    'INSERT OR IGNORE INTO students (group_id, list_number, full_name, username, password) VALUES (?, ?, ?, ?, ?)'
                );
                const result = await insertStudent.run(group.id, listNumber, fullName, listNumber.toString(), '1234');

                if (result.changes > 0) {
                    totalCreated++;
                }

                rowIndex++;
            }
        }

        res.json({ success: true, count: totalCreated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Listar estudiantes
router.get('/', async (req, res) => {
    try {
        const stmt = await db.prepare(`
            SELECT s.*, g.name as group_name 
            FROM students s 
            JOIN groups g ON s.group_id = g.id
            ORDER BY g.name, s.list_number
        `);
        const students = await stmt.all();
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Login de estudiante
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const stmt = await db.prepare(
            'SELECT s.*, g.name as group_name FROM students s JOIN groups g ON s.group_id = g.id WHERE s.username = ? AND s.password = ?'
        );
        const student = await stmt.get(username, password);

        if (student) {
            res.json({ success: true, student });
        } else {
            res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
