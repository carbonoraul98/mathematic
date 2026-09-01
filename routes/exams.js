const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const db = require('../models/database');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// Función para parsear texto de DOCX y extraer preguntas
function parseQuestionsFromText(text) {
    const questions = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let currentQuestion = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Detectar pregunta (número seguido de punto o paréntesis)
        const questionMatch = line.match(/^(\d+)[:.\)]\s*(.+)/);
        if (questionMatch) {
            if (currentQuestion) {
                questions.push(currentQuestion);
            }
            currentQuestion = {
                question_text: questionMatch[2],
                options: [],
                correct_answer: null,
                question_type: 'multiple_choice'
            };
            continue;
        }
        
        // Detectar opciones (A, B, C, D seguido de ) o -)
        const optionMatch = line.match(/^([A-Da-d])[:.\)]\s*(.+)/);
        if (optionMatch && currentQuestion) {
            currentQuestion.options.push(optionMatch[2]);
            continue;
        }
        
        // Detectar respuesta correcta
        const answerMatch = line.match(/(?:Respuesta|Answer|Correcta)[:\s]*([A-Da-d])/i);
        if (answerMatch && currentQuestion) {
            const ans = answerMatch[1].toUpperCase();
            const idx = ans.charCodeAt(0) - 65; // A=0, B=1, etc.
            currentQuestion.correct_answer = idx.toString();
        }
    }
    
    if (currentQuestion) {
        questions.push(currentQuestion);
    }
    
    return questions;
}

// Subir examen JSON
router.post('/json', async (req, res) => {
    try {
        const { title, grade, questions: examQuestions } = req.body;
        
        if (!title || !examQuestions || !Array.isArray(examQuestions)) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }
        
        // Crear actividad
        const insertActivity = await db.prepare(
            'INSERT INTO activities (title, type, theme) VALUES (?, ?, ?)'
        );
        const activityResult = await insertActivity.run(title, 'Examen', `Grado ${grade || 'General'}`);
        const activityId = activityResult.lastInsertRowid;
        
        // Insertar preguntas
        const insertQuestion = await db.prepare(
            'INSERT INTO questions (activity_id, question_text, question_type, options, correct_answer, points, order_num) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        
        for (let i = 0; i < examQuestions.length; i++) {
            const q = examQuestions[i];
            await insertQuestion.run(
                activityId,
                q.question || q.text || q.pregunta,
                q.type || 'multiple_choice',
                JSON.stringify(q.options || q.opciones || []),
                (q.correct !== undefined ? q.correct : q.correcta !== undefined ? q.correcta : 0).toString(),
                q.points || q.puntos || 10,
                i
            );
        }
        
        res.json({ success: true, activity_id: activityId, questions_count: examQuestions.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Subir examen DOCX
router.post('/docx', upload.single('exam'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó archivo' });
        }
        
        // Extraer texto del DOCX
        const result = await mammoth.extractRawText({ path: req.file.path });
        const text = result.value;
        
        // Parsear preguntas
        const questions = parseQuestionsFromText(text);
        
        if (questions.length === 0) {
            return res.status(400).json({ error: 'No se encontraron preguntas en el documento' });
        }
        
        // Crear actividad
        const title = req.body.title || 'Examen importado';
        const grade = req.body.grade || '';
        
        const insertActivity = await db.prepare(
            'INSERT INTO activities (title, type, theme) VALUES (?, ?, ?)'
        );
        const activityResult = await insertActivity.run(title, 'Examen', grade);
        const activityId = activityResult.lastInsertRowid;
        
        // Insertar preguntas
        const insertQuestion = await db.prepare(
            'INSERT INTO questions (activity_id, question_text, question_type, options, correct_answer, points, order_num) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            await insertQuestion.run(
                activityId,
                q.question_text,
                q.question_type,
                JSON.stringify(q.options),
                q.correct_answer || '0',
                10,
                i
            );
        }
        
        res.json({ 
            success: true, 
            activity_id: activityId, 
            questions_count: questions.length,
            preview: questions.slice(0, 3)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener preguntas de un examen
router.get('/:activityId/questions', async (req, res) => {
    try {
        const stmt = await db.prepare(
            'SELECT * FROM questions WHERE activity_id = ? ORDER BY order_num'
        );
        const questions = await stmt.all(req.params.activityId);
        
        // Parsear opciones JSON
        questions.forEach(q => {
            if (q.options) {
                try {
                    q.options = JSON.parse(q.options);
                } catch(e) {
                    q.options = [];
                }
            }
        });
        
        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
