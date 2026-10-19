const { connectionPromise, Question } = require('../models/database');

function generateFourthOption(qText, existingOptions, correctAnswer) {
    const rawList = [...existingOptions].map(t => String(t).trim());
    const correct = String(correctAnswer || '').trim();

    // Check if numeric
    const cleanNum = correct.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleanNum);

    if (!isNaN(num)) {
        // Try common offsets that don't collide
        const deltas = [2, -2, 5, -5, 10, -10, 1, -1, 15, -15, 20, -20, 50, 100];
        for (const d of deltas) {
            const val = num + d;
            if (val >= 0) {
                // If original had thousands separator, format it
                let formatted = String(val);
                if (correct.includes('.') && val >= 1000) {
                    formatted = val.toLocaleString('es-CO');
                }
                if (!rawList.some(o => o.toLowerCase() === formatted.toLowerCase())) {
                    return formatted;
                }
            }
        }
    }

    // Check if fraction (e.g. "3/4" or "2/4 (equivalente a 1/2)")
    const fractionMatch = correct.match(/(\d+)\s*\/\s*(\d+)/);
    if (fractionMatch) {
        const n = parseInt(fractionMatch[1], 10);
        const d = parseInt(fractionMatch[2], 10);
        const fractionCandidates = [
            `${n + 1}/${d}`,
            `${Math.max(1, n - 1)}/${d}`,
            `${n}/${d + 1}`,
            `${n}/${Math.max(2, d - 1)}`,
            `${n + 2}/${d}`,
            `1/${d}`
        ];
        for (const fc of fractionCandidates) {
            if (!rawList.some(o => o.toLowerCase() === fc.toLowerCase())) {
                return fc;
            }
        }
    }

    // Check if coordinate like (6, 10)
    const coordMatch = correct.match(/\((\d+),\s*(\d+)\)/);
    if (coordMatch) {
        const x = parseInt(coordMatch[1], 10);
        const y = parseInt(coordMatch[2], 10);
        const coordCandidates = [
            `(${x + 2}, ${y})`,
            `(${x}, ${y - 2})`,
            `(${y}, ${x})`,
            `(${x + 1}, ${y + 1})`
        ];
        for (const cc of coordCandidates) {
            if (!rawList.some(o => o.toLowerCase() === cc.toLowerCase())) {
                return cc;
            }
        }
    }

    // Default sensible fallback
    const fallbacks = [
        'Ninguna de las anteriores',
        'No es posible determinarlo',
        'Todas las anteriores son correctas',
        'Resultado indefinido'
    ];
    for (const fb of fallbacks) {
        if (!rawList.some(o => o.toLowerCase() === fb.toLowerCase())) {
            return fb;
        }
    }

    return `Opción D (${rawList.length + 1})`;
}

async function migrateQuestions() {
    await connectionPromise;
    console.log('Migrando preguntas para asegurar 4 opciones (A a D)...');

    const questions = await Question.find();
    let updatedCount = 0;

    for (const q of questions) {
        let opts = [];
        try { opts = JSON.parse(q.options) || []; } catch(e) { opts = []; }

        if (q.question_type === 'opcion' || q.question_type === 'multiple_choice' || opts.length > 0) {
            let changed = false;
            while (opts.length < 4) {
                const newOpt = generateFourthOption(q.question_text, opts, q.correct_answer);
                opts.push(newOpt);
                changed = true;
            }

            if (changed) {
                q.options = JSON.stringify(opts);
                await q.save();
                updatedCount++;
            }
        }
    }

    console.log(`✅ Migración completada. ${updatedCount} preguntas actualizadas a 4 opciones.`);
}

if (require.main === module) {
    migrateQuestions().then(() => process.exit(0)).catch(err => {
        console.error('Error en migración:', err);
        process.exit(1);
    });
}

module.exports = { migrateQuestions, generateFourthOption };
