const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const { Activity, Question } = require('../models/database');
const router = express.Router();

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

// Función para parsear texto de DOCX y extraer preguntas y respuestas
function parseQuestionsFromText(text) {
    const questions = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let currentQuestion = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Detectar pregunta: Ej: "1. ¿Cuánto es...?", "1) ...", "Pregunta 1: ...", "1 - ..."
        const questionMatch = line.match(/^(?:Pregunta\s*)?(\d+)[:.\)-]\s*(.+)/i);
        if (questionMatch) {
            if (currentQuestion && currentQuestion.options.length > 0) {
                questions.push(currentQuestion);
            }
            currentQuestion = {
                question_text: questionMatch[2].trim(),
                options: [],
                correct_letter: null,
                correct_answer: null,
                question_type: 'multiple_choice'
            };
            continue;
        }
        
        // Detectar opciones: Ej: "A) 12", "a. 12", "B - 24", "C. 30"
        const optionMatch = line.match(/^([A-Da-d])[:.\)-]\s*(.+)/);
        if (optionMatch && currentQuestion) {
            const letter = optionMatch[1].toUpperCase();
            const optionText = optionMatch[2].trim();
            currentQuestion.options.push({ letter, text: optionText });
            continue;
        }
        
        // Detectar respuesta correcta: Ej: "Respuesta: B", "Respuesta correcta: A", "Solución: C", "Correcta: B", "Rta: D", "R: A"
        const answerMatch = line.match(/(?:Respuesta(?:\s+correcta)?|Answer|Correcta|Soluci[oó]n|Rta|R)[:\s]*([A-Da-d])/i);
        if (answerMatch && currentQuestion) {
            currentQuestion.correct_letter = answerMatch[1].toUpperCase();
            continue;
        }

        // Si es una línea que complementa el texto de la pregunta previa
        if (currentQuestion && currentQuestion.options.length === 0) {
            currentQuestion.question_text += ' ' + line;
        }
    }
    
    if (currentQuestion && currentQuestion.options.length > 0) {
        questions.push(currentQuestion);
    }
    
    return questions.map(q => {
        const rawOptions = q.options.map(opt => opt.text);
        let correctText = rawOptions[0] || '';
        
        if (q.correct_letter) {
            const found = q.options.find(opt => opt.letter === q.correct_letter);
            if (found) {
                correctText = found.text;
            }
        }
        
        return {
            question_text: q.question_text,
            options: rawOptions,
            correct_answer: correctText
        };
    });
}

// Subir examen o actividad en formato Word (.docx)
router.post('/docx', upload.single('exam'), async (req, res) => {
    let filePath = null;
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó ningún archivo de Word (.docx)' });
        }
        filePath = req.file.path;
        
        const result = await mammoth.extractRawText({ path: filePath });
        const text = result.value;
        
        const questions = parseQuestionsFromText(text);
        if (questions.length === 0) {
            return res.status(400).json({ error: 'No se encontraron preguntas con opciones en el documento de Word' });
        }
        
        const title = (req.body.title || '').trim() || 'Evaluación importada de Word';
        const type = (req.body.type || '').trim() || 'Examen';
        const grade = (req.body.grade || '').trim() || 'General';
        const group_id = req.body.group_id;
        const target_groups = req.body.target_groups;
        const is_training_level = req.body.is_training_level === 'true' || req.body.is_training_level === true;
        const training_grade = req.body.training_grade ? String(req.body.training_grade).trim() : (grade.includes('5') ? '5' : '4');
        const map_icon = (req.body.map_icon || '').trim() || (type === 'Examen' ? '📝' : '🏆');
        
        let targets = [];
        if (target_groups) {
            if (Array.isArray(target_groups)) {
                targets = target_groups.map(Number);
            } else if (typeof target_groups === 'string') {
                try {
                    const parsed = JSON.parse(target_groups);
                    if (Array.isArray(parsed)) targets = parsed.map(Number);
                    else targets = [Number(target_groups)];
                } catch(e) {
                    targets = target_groups.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
                }
            }
        } else if (group_id) {
            targets = [Number(group_id)];
        }
        
        const primaryGroupId = group_id ? Number(group_id) : (targets[0] || null);
        
        const activity = await Activity.create({
            title,
            type,
            theme: `Grado ${grade}`,
            group_id: primaryGroupId,
            target_groups: targets,
            is_training_level,
            training_grade,
            map_icon
        });
        
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            
            // Barajar opciones para asegurar distribución equitativa
            const opts = [...q.options];
            for (let j = opts.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [opts[j], opts[k]] = [opts[k], opts[j]];
            }
            
            await Question.create({
                activity_id: activity.id,
                question_text: q.question_text,
                question_type: 'opcion',
                options: JSON.stringify(opts),
                correct_answer: q.correct_answer,
                points: 10,
                order_num: i
            });
        }
        
        res.json({
            success: true,
            activity_id: activity.id,
            questions_count: questions.length,
            title: activity.title,
            is_training_level: activity.is_training_level,
            training_grade: activity.training_grade
        });
    } catch (error) {
        console.error('Error al procesar archivo DOCX:', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (filePath && fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) {}
        }
    }
});

// Listar todas las actividades/exámenes
router.get('/', async (req, res) => {
    try {
        const activities = await Activity.find().sort({ created_at: -1 });
        res.json(activities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener preguntas de un examen
router.get('/:activityId/questions', async (req, res) => {
    try {
        const questions = await Question.find({ activity_id: Number(req.params.activityId) }).sort({ order_num: 1 });
        
        const formatted = questions.map(q => {
            const qObj = q.toObject();
            if (qObj.options) {
                try {
                    qObj.options = JSON.parse(qObj.options);
                } catch(e) {
                    qObj.options = [];
                }
            } else {
                qObj.options = [];
            }
            return qObj;
        });
        
        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
