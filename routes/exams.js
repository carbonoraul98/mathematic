const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { Activity, Question, Group } = require('../models/database');
const { generateFourthOption } = require('../scripts/migrateQuestionsToFourOptions');
const router = express.Router();

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

// Función para parsear texto de DOCX, PDF y Google Docs con máxima tolerancia a formatos
function parseQuestionsFromText(text) {
    if (!text || typeof text !== 'string') return [];

    // 1. Decodificar entidades HTML y limpiar tags si proviene de Google Docs web / HTML
    let clean = text
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"');

    // 2. Normalizar saltos de línea y desglosar opciones pegadas en una sola línea
    const rawLines = clean.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const lines = [];

    for (let r of rawLines) {
        let trimmed = r.trim();
        if (!trimmed) continue;

        // Si la línea contiene múltiples opciones pegadas (Ej: "A) 12  B) 24  C) 36  D) 48")
        const inlineOptRegex = /(?:^|\s+)((?:[*✓•\-]\s*)?\(?[A-Da-d]\)?[\.:\)-]\s*)/g;
        const matches = [...trimmed.matchAll(inlineOptRegex)];
        if (matches.length > 1 && /^\(?\s*[*✓•\-]?\s*[A-Da-d]\s*[\.:\)-]/.test(trimmed)) {
            let lastIdx = 0;
            for (let m = 1; m < matches.length; m++) {
                const splitPos = matches[m].index;
                lines.push(trimmed.slice(lastIdx, splitPos).trim());
                lastIdx = splitPos;
            }
            lines.push(trimmed.slice(lastIdx).trim());
        } else {
            lines.push(trimmed);
        }
    }

    const questions = [];
    let currentQuestion = null;

    const isAnswerLine = (l) => {
        return /(?:Respuesta(?:\s+correcta)?|Rta\.?|R\/?|Resp\.?|Soluci[oó]n|Clave|Opci[oó]n\s+correcta|Answer)[:\s=]+/i.test(l);
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 1. Detectar Pregunta
        // Soporta: "1. Texto", "1) Texto", "1.- Texto", "(1) Texto", "Pregunta 1: Texto", "P1: Texto", "1 Texto"
        const qMatch = line.match(/^(?:Pregunta|Problema|Ejercicio|Item|Ítem|P)?\s*\(?(\d+)[\.:\)\-\º\°]+\s*(.+)/i) ||
                       line.match(/^\(?(\d+)\)\s+(.+)/);

        if (qMatch) {
            if (currentQuestion && currentQuestion.options.length > 0) {
                questions.push(currentQuestion);
            }
            currentQuestion = {
                question_text: qMatch[2].trim(),
                options: [],
                correct_letter: null,
                correct_answer_text: null
            };
            continue;
        }

        // 2. Detectar Declaración de Respuesta Correcta
        // Soporta: "Respuesta: B", "Rta: (B)", "R/: B", "Respuesta correcta: 42", "Clave: C", etc.
        if (isAnswerLine(line) && currentQuestion) {
            const letterMatch = line.match(/(?:Respuesta(?:\s+correcta)?|Rta\.?|R\/?|Resp\.?|Soluci[oó]n|Clave|Opci[oó]n\s+correcta|Answer)[:\s=\/esla]*\(?([A-Da-d])\)?/i);
            if (letterMatch) {
                currentQuestion.correct_letter = letterMatch[1].toUpperCase();
            } else {
                const textAns = line.replace(/(?:Respuesta(?:\s+correcta)?|Rta\.?|R\/?|Resp\.?|Soluci[oó]n|Clave|Opci[oó]n\s+correcta|Answer)[:\s=\/]+/i, '').trim();
                if (textAns) {
                    currentQuestion.correct_answer_text = textAns;
                }
            }
            continue;
        }

        // 3. Detectar Opción
        // Soporta: "A) Texto", "(A) Texto", "[A] Texto", "A. Texto", "A - Texto", "* A) Texto", "A) Texto *", "A) Texto (correcta)"
        const optMatch = line.match(/^([*•\-✓]?)\s*\(?([A-Da-d])\)?[\.:\)\-]?\s*(.+)/);
        if (optMatch && currentQuestion) {
            const prefixMarker = optMatch[1];
            const letter = optMatch[2].toUpperCase();
            let optText = optMatch[3].trim();

            let isMarkedCorrect = prefixMarker.includes('*') || prefixMarker.includes('✓');
            if (/\*$/.test(optText)) {
                isMarkedCorrect = true;
                optText = optText.replace(/\*+$/, '').trim();
            }
            if (/\((?:correcta|respuesta\s*correcta|x|v)\)$/i.test(optText)) {
                isMarkedCorrect = true;
                optText = optText.replace(/\((?:correcta|respuesta\s*correcta|x|v)\)$/i, '').trim();
            }

            if (isMarkedCorrect) {
                currentQuestion.correct_letter = letter;
            }

            currentQuestion.options.push({ letter, text: optText });
            continue;
        }

        // 4. Complemento multilínea
        if (currentQuestion) {
            if (currentQuestion.options.length > 0) {
                const lastOpt = currentQuestion.options[currentQuestion.options.length - 1];
                lastOpt.text += ' ' + line;
            } else {
                currentQuestion.question_text += ' ' + line;
            }
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
        } else if (q.correct_answer_text) {
            const found = q.options.find(opt => opt.text.trim().toLowerCase() === q.correct_answer_text.trim().toLowerCase());
            if (found) {
                correctText = found.text;
            }
        }

        if (rawOptions.length < 4 && rawOptions.length > 0) {
            while (rawOptions.length < 4) {
                rawOptions.push(generateFourthOption(q.question_text, rawOptions, correctText));
            }
        }

        return {
            question_text: q.question_text,
            options: rawOptions.slice(0, 4),
            correct_answer: correctText
        };
    });
}

// Subir examen o actividad en formato Word (.docx), PDF (.pdf) o Google Docs
const handleImportExam = async (req, res) => {
    let filePath = null;
    try {
        let text = '';
        let inferredTitle = '';

        if (req.file) {
            filePath = req.file.path;
            const originalName = (req.file.originalname || '').toLowerCase();
            const mimetype = (req.file.mimetype || '').toLowerCase();
            inferredTitle = (req.file.originalname || '').replace(/\.[^/.]+$/, "");

            if (originalName.endsWith('.pdf') || mimetype.includes('pdf')) {
                const dataBuffer = fs.readFileSync(filePath);
                const pdfData = await pdfParse(dataBuffer);
                text = pdfData.text || '';
            } else if (originalName.endsWith('.txt') || mimetype.includes('text/plain')) {
                text = fs.readFileSync(filePath, 'utf-8');
            } else {
                // Word (.docx) default
                const result = await mammoth.extractRawText({ path: filePath });
                text = result.value || '';
            }
        } else if (req.body.google_docs_url) {
            const gUrl = req.body.google_docs_url.trim();
            const isPub = gUrl.includes('/document/d/e/');
            let docId = null;
            let exportUrl = null;

            if (isPub) {
                const pubMatch = gUrl.match(/\/document\/d\/e\/([a-zA-Z0-9-_]+)/);
                if (!pubMatch) {
                    return res.status(400).json({ error: 'El enlace de Google Docs publicado no es válido.' });
                }
                exportUrl = `https://docs.google.com/document/d/e/${pubMatch[1]}/pub`;
            } else {
                const docIdMatch = gUrl.match(/\/document\/(?:u\/\d+\/)?d\/([a-zA-Z0-9-_]+)/);
                if (!docIdMatch) {
                    return res.status(400).json({ 
                        error: 'El enlace de Google Docs no es válido. Formato esperado: https://docs.google.com/document/d/ID_DEL_DOCUMENTO/edit' 
                    });
                }
                docId = docIdMatch[1];
                exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
            }

            inferredTitle = 'Evaluación importada de Google Docs';

            try {
                const gRes = await fetch(exportUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
                    redirect: 'follow'
                });
                if (!gRes.ok) {
                    return res.status(400).json({ 
                        error: 'No se pudo acceder al documento de Google Docs. Asegúrate de que el documento esté compartido como "Cualquier persona con el enlace puede leer", o descárgalo como .docx o .pdf y súbelo directamente.' 
                    });
                }
                text = await gRes.text();

                // Si Google redirigió a pantalla de login
                if (text.includes('ServiceLogin') || text.includes('accounts.google.com') || (text.includes('<!DOCTYPE html>') && text.includes('Iniciar sesión'))) {
                    return res.status(400).json({
                        error: 'El documento de Google Docs está privado o requiere inicio de sesión. Por favor haz clic en "Compartir" en Google Docs y selecciona "Cualquier persona con el enlace" como Lector, o descárgalo como Word (.docx) o PDF para subirlo directamente.'
                    });
                }
            } catch (fetchErr) {
                return res.status(400).json({ 
                    error: 'Error conectando con Google Docs. Verifica tu conexión o descarga el archivo como Word/PDF para subirlo.' 
                });
            }
        } else {
            return res.status(400).json({ error: 'No se proporcionó ningún archivo (.docx, .pdf) ni enlace de Google Docs' });
        }

        const questions = parseQuestionsFromText(text);
        if (questions.length === 0) {
            return res.status(400).json({ 
                error: 'No se detectaron preguntas en el documento. Asegúrate de enumerar las preguntas (ej. 1., 2.), incluir opciones (A, B, C, D) y la respuesta (ej. Respuesta: B).' 
            });
        }
        
        const title = (req.body.title || '').trim() || inferredTitle || 'Evaluación importada';
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
        
        if (targets.length === 0 && grade) {
            const cleanGrade = grade.includes('5') ? '5' : (grade.includes('4') ? '4' : '');
            if (cleanGrade) {
                const gradeGroups = await Group.find({ name: { $regex: new RegExp(`^${cleanGrade}`) } });
                targets = gradeGroups.map(g => g.id);
            }
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
};

router.post('/docx', upload.single('exam'), handleImportExam);
router.post('/import', upload.single('exam'), handleImportExam);

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

router.parseQuestionsFromText = parseQuestionsFromText;
module.exports = router;
