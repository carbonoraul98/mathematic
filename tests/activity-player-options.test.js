const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const app = require('../server');
const { connectionPromise, Question, Activity } = require('../models/database');

function request(app) {
    const server = http.createServer(app);
    return {
        async get(path) {
            return new Promise((resolve, reject) => {
                server.listen(0, () => {
                    const port = server.address().port;
                    http.get(`http://127.0.0.1:${port}${path}`, (res) => {
                        let data = '';
                        res.on('data', chunk => data += chunk);
                        res.on('end', () => {
                            server.close();
                            try {
                                resolve({ status: res.statusCode, body: JSON.parse(data) });
                            } catch (e) {
                                resolve({ status: res.statusCode, text: data });
                            }
                        });
                    }).on('error', err => {
                        server.close();
                        reject(err);
                    });
                });
            });
        },
        async put(path, body) {
            return new Promise((resolve, reject) => {
                server.listen(0, () => {
                    const port = server.address().port;
                    const postData = JSON.stringify(body);
                    const req = http.request({
                        hostname: '127.0.0.1',
                        port,
                        path,
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(postData)
                        }
                    }, (res) => {
                        let data = '';
                        res.on('data', chunk => data += chunk);
                        res.on('end', () => {
                            server.close();
                            try {
                                resolve({ status: res.statusCode, body: JSON.parse(data) });
                            } catch (e) {
                                resolve({ status: res.statusCode, text: data });
                            }
                        });
                    });
                    req.on('error', err => {
                        server.close();
                        reject(err);
                    });
                    req.write(postData);
                    req.end();
                });
            });
        }
    };
}

test('Activity Player & API - All questions support options A to D and preserve D', async () => {
    await connectionPromise;
    const req = request(app);

    // 1. Fetch activities list
    const res = await req.get('/api/activities');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length > 0);

    // Pick an activity with questions
    const actWithQuestions = res.body.find(a => a.preguntas && a.preguntas.length > 0);
    assert.ok(actWithQuestions, 'Debe haber al menos una actividad con preguntas');

    const firstQ = actWithQuestions.preguntas[0];
    assert.ok(firstQ.a !== undefined, 'Debe incluir opción A');
    assert.ok(firstQ.b !== undefined, 'Debe incluir opción B');
    assert.ok(firstQ.c !== undefined, 'Debe incluir opción C');
    assert.ok(firstQ.d !== undefined, 'Debe incluir opción D');

    // 2. Test updating a question with 4 options (A, B, C, D)
    const updateRes = await req.put(`/api/activities/${actWithQuestions.id}/questions/${firstQ.id}`, {
        pregunta: firstQ.pregunta,
        tipo: 'opcion',
        a: 'Opción 1',
        b: 'Opción 2',
        c: 'Opción 3',
        d: 'Opción 4',
        correcta: 'Opción 2'
    });
    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.success, true);

    // Fetch the updated activity directly
    const singleRes = await req.get(`/api/activities/${actWithQuestions.id}`);
    assert.equal(singleRes.status, 200);
    const updatedQ = singleRes.body.preguntas.find(q => q.id === firstQ.id);
    assert.ok(updatedQ);
    assert.equal(updatedQ.d, 'Opción 4', 'La opción D debe persistir y devolverse en la API');
    assert.equal(updatedQ.correcta, 'Opción 2');
});

test.after(async () => {
    const { mongoose } = require('../models/database');
    await mongoose.disconnect();
});
