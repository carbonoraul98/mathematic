const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../server');
const { connectionPromise, mongoose, Activity, Question } = require('../models/database');
const { parseQuestionsFromText } = require('../routes/exams');

let server;
let baseUrl;

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
});

test.after(async () => {
    await Activity.deleteMany({ title: { $in: ['Prueba PDF Import', 'Prueba Google Docs Import'] } });
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.disconnect();
});

test('parseQuestionsFromText - converts 3 options to 4 options (A-D)', () => {
    const rawText = `
    1. ¿Cuánto es 25 + 17?
    A) 32
    B) 42
    C) 52
    Respuesta: B

    2. ¿Cuál es la capital de Colombia?
    A) Bogotá
    B) Medellín
    C) Cali
    D) Barranquilla
    Respuesta: A
    `;

    const parsed = parseQuestionsFromText(rawText);
    assert.equal(parsed.length, 2);
    
    // First question had 3 options originally; must now have 4 options
    assert.equal(parsed[0].options.length, 4);
    assert.equal(parsed[0].correct_answer, '42');
    
    // Second question already had 4 options
    assert.equal(parsed[1].options.length, 4);
    assert.equal(parsed[1].correct_answer, 'Bogotá');
});

test('POST /api/exams/import - rejects invalid Google Docs link gracefully', async () => {
    const res = await fetch(`${baseUrl}/api/exams/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            google_docs_url: 'https://invalid-url.com/something',
            title: 'Prueba Fallida'
        })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes('Google Docs'));
});
