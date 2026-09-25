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

// Función para calcular el nivel basado en el total_score (XP)
function calculateLevel(total_score) {
    // Cada pregunta da 10 XP. Una práctica de 3 preguntas = 30 XP.
    // Ajustamos a 30 para que una práctica perfecta suba de nivel.
    const xpPerLevel = 30;
    const score = total_score || 0;
    const currentLevel = Math.floor(score / xpPerLevel) + 1;
    const currentXP = score % xpPerLevel;
    const progressPercent = Math.round((currentXP / xpPerLevel) * 100);
    
    return {
        level: currentLevel,
        currentXP,
        xpPerLevel,
        progressPercent
    };
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

// Crear estudiante individual
router.post('/', async (req, res) => {
    try {
        const { grado, nombre, usuario, password } = req.body;
        
        if (!nombre || !usuario || !grado) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }
        
        // Insertar grupo si no existe
        const insertGroup = await db.prepare('INSERT OR IGNORE INTO groups (name, teacher_name) VALUES (?, ?)');
        await insertGroup.run(grado, '');
        
        const getGroup = await db.prepare('SELECT id FROM groups WHERE name = ?');
        const group = await getGroup.get(grado);
        
        // Determinar un list_number único para evitar UNIQUE constraint failed
        let list_number = parseInt(usuario);
        if (isNaN(list_number)) {
            const getMax = await db.prepare('SELECT MAX(list_number) as max_list FROM students WHERE group_id = ?');
            const maxResult = await getMax.get(group.id);
            list_number = (maxResult && maxResult.max_list !== null) ? maxResult.max_list + 1 : 1;
        } else {
            // Check si ya existe, si existe, buscar el siguiente disponible
            const checkExist = await db.prepare('SELECT id FROM students WHERE group_id = ? AND list_number = ?');
            let exists = await checkExist.get(group.id, list_number);
            while (exists) {
                list_number++;
                exists = await checkExist.get(group.id, list_number);
            }
        }
        
        // Insertar estudiante
        const insertStudent = await db.prepare(
            'INSERT INTO students (group_id, list_number, full_name, username, password) VALUES (?, ?, ?, ?, ?)'
        );
        const result = await insertStudent.run(group.id, list_number, nombre, usuario, password || '1234');
        
        res.json({ success: true, student_id: result.lastInsertRowid });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
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
        
        // Agregar info de nivel a cada estudiante
        const studentsWithLevels = students.map(s => ({
            ...s,
            levelInfo: calculateLevel(s.total_score)
        }));
        
        res.json(studentsWithLevels);
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
            // Calcular nivel y adjuntar
            student.levelInfo = calculateLevel(student.total_score);
            res.json({ success: true, student });
        } else {
            res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Añadir XP (puntos de práctica) a un estudiante
router.post('/:id/add-xp', async (req, res) => {
    try {
        const { id } = req.params;
        const { xp } = req.body;
        
        if (!xp || isNaN(xp)) {
            return res.status(400).json({ error: 'XP válido es requerido' });
        }

        // Obtener score actual
        const getStmt = await db.prepare('SELECT total_score FROM students WHERE id = ?');
        const student = await getStmt.get(id);
        
        if (!student) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }

        const newScore = (student.total_score || 0) + parseInt(xp);
        
        // Actualizar
        const updateStmt = await db.prepare('UPDATE students SET total_score = ? WHERE id = ?');
        await updateStmt.run(newScore, id);
        
        const newLevelInfo = calculateLevel(newScore);
        
        res.json({ 
            success: true, 
            total_score: newScore,
            levelInfo: newLevelInfo
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Resetear progreso (volver a 0)
router.post('/:id/reset', async (req, res) => {
    try {
        const { id } = req.params;
        const updateStmt = await db.prepare('UPDATE students SET total_score = 0 WHERE id = ?');
        await updateStmt.run(id);
        
        // Opcional: borrar historial de intentos (attempts)
        const deleteAttempts = await db.prepare('DELETE FROM attempts WHERE student_id = ?');
        await deleteAttempts.run(id);
        
        res.json({ success: true, message: 'Progreso reiniciado a 0' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
