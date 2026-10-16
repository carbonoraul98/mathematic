const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const app = require('../server');
const { connectionPromise, mongoose, Activity, Question } = require('../models/database');

let server;
let baseUrl;
const testDocxPath = path.join(__dirname, 'test_sample.docx');

test.before(async () => {
    await connectionPromise;
    await new Promise((resolve) => {
        server = http.createServer(app);
        server.listen(0, () => {
            const port = server.address().port;
            baseUrl = `http://127.0.0.1:${port}`;
            resolve();
        });
    });

    // Crear un archivo .docx de prueba válido
    const tmpDir = path.join(__dirname, 'tmp_docx');
    fs.mkdirSync(path.join(tmpDir, 'word'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, '[Content_Types].xml'), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);
    fs.writeFileSync(path.join(tmpDir, 'word', 'document.xml'), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>1. ¿Cuánto es 15 x 3?</w:t></w:r></w:p>
    <w:p><w:r><w:t>A) 40</w:t></w:r></w:p>
    <w:p><w:r><w:t>B) 45</w:t></w:r></w:p>
    <w:p><w:r><w:t>C) 50</w:t></w:r></w:p>
    <w:p><w:r><w:t>Respuesta: B</w:t></w:r></w:p>
    <w:p><w:r><w:t>2. ¿Cuánto es 72 / 8?</w:t></w:r></w:p>
    <w:p><w:r><w:t>A) 9</w:t></w:r></w:p>
    <w:p><w:r><w:t>B) 8</w:t></w:r></w:p>
    <w:p><w:r><w:t>C) 7</w:t></w:r></w:p>
    <w:p><w:r><w:t>Respuesta: A</w:t></w:r></w:p>
  </w:body>
</w:document>`);
    execSync(`cd "${tmpDir}" && zip -r "${testDocxPath}" '[Content_Types].xml' word > /dev/null 2>&1`);
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

test.after(async () => {
    if (fs.existsSync(testDocxPath)) {
        fs.unlinkSync(testDocxPath);
    }
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.disconnect();
});

test('Manual Activity - Create with training level enabled', async () => {
    const res = await fetch(`${baseUrl}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'Taller de Fracciones Especial',
            type: 'Taller',
            theme: 'Grado 4',
            grade: '4',
            is_training_level: true,
            training_grade: '4',
            map_icon: '🥧',
            questions: [
                { pregunta: '¿Qué es 1/2 + 1/2?', tipo: 'opcion', a: '1', b: '2', c: '1/4', correcta: '1' }
            ]
        })
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.success, true);

    const saved = await Activity.findOne({ id: body.activity_id });
    assert.ok(saved);
    assert.equal(saved.is_training_level, true);
    assert.equal(saved.training_grade, '4');
    assert.equal(saved.map_icon, '🥧');
});

test('Manual Activity - Update training level attributes via PUT', async () => {
    const act = await Activity.create({
        title: 'Quiz de Prueba',
        type: 'Quiz',
        theme: 'Grado 5',
        is_training_level: false
    });

    const res = await fetch(`${baseUrl}/api/activities/${act.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'Quiz de Prueba Promovido',
            type: 'Quiz',
            theme: 'Grado 5',
            is_training_level: true,
            training_grade: '5',
            map_icon: '⚡'
        })
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.success, true);

    const updated = await Activity.findOne({ id: act.id });
    assert.equal(updated.is_training_level, true);
    assert.equal(updated.training_grade, '5');
    assert.equal(updated.map_icon, '⚡');
});

test('Word (.docx) Upload - Process document and create playable training level', async () => {
    const fileBuffer = fs.readFileSync(testDocxPath);
    const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const formData = new FormData();
    formData.append('exam', blob, 'evaluacion.docx');
    formData.append('title', 'Evaluación Docx Bimestral');
    formData.append('type', 'Examen');
    formData.append('grade', '5');
    formData.append('is_training_level', 'true');
    formData.append('training_grade', '5');
    formData.append('map_icon', '📝');

    const res = await fetch(`${baseUrl}/api/exams/docx`, {
        method: 'POST',
        body: formData
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.questions_count, 2);
    assert.equal(body.is_training_level, true);
    assert.equal(body.training_grade, '5');

    const act = await Activity.findOne({ id: body.activity_id });
    assert.ok(act);
    assert.equal(act.title, 'Evaluación Docx Bimestral');
    assert.equal(act.is_training_level, true);
    assert.equal(act.training_grade, '5');
    assert.equal(act.map_icon, '📝');

    const questions = await Question.find({ activity_id: act.id }).sort({ order_num: 1 });
    assert.equal(questions.length, 2);
    assert.equal(questions[0].question_text, '¿Cuánto es 15 x 3?');
    assert.equal(questions[0].correct_answer, '45');
    assert.equal(questions[1].question_text, '¿Cuánto es 72 / 8?');
    assert.equal(questions[1].correct_answer, '9');
});
