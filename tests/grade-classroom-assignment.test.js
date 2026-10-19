const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../server');
const { connectionPromise, mongoose, Activity, Group } = require('../models/database');

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
    await Activity.deleteMany({ title: { $in: ['Taller General 4to Test', 'Taller General 5to Test', 'Quiz 4A Exclusivo Test'] } });
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.disconnect();
});

test('Grade & Classroom Isolation - General 4th grade activity is received only by 4th grade classrooms', async () => {
    // 1. Crear actividad General para 4° Grado (sin especificar aula puntual, enviando grado 4)
    const createRes = await fetch(`${baseUrl}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'Taller General 4to Test',
            type: 'Taller',
            theme: 'Grado 4',
            grade: '4',
            questions: [
                { pregunta: '¿2+2?', tipo: 'opcion', a: '4', b: '5', c: '6', d: '7', correcta: '4' }
            ]
        })
    });

    const created = await createRes.json();
    assert.equal(createRes.status, 200);
    assert.equal(created.success, true);
    
    // Debe haber asignado las aulas de 4° (IDs 1 y 2 correspondientes a 4A y 4B)
    assert.ok(Array.isArray(created.target_groups));
    assert.ok(created.target_groups.includes(1), 'Debe incluir aula 4A (ID 1)');
    assert.ok(created.target_groups.includes(2), 'Debe incluir aula 4B (ID 2)');
    assert.ok(!created.target_groups.includes(3), 'NO debe incluir aula 5A (ID 3)');

    // 2. Consultar como estudiante de 4A (groupId = 1) -> Debe aparecer
    const res4A = await fetch(`${baseUrl}/api/activities?groupId=1`);
    const acts4A = await res4A.json();
    const foundIn4A = acts4A.some(a => a.id === created.activity_id);
    assert.equal(foundIn4A, true, 'Estudiante de 4A debe ver el taller general de 4to');

    // 3. Consultar como estudiante de 5A (groupId = 3) -> NO debe aparecer
    const res5A = await fetch(`${baseUrl}/api/activities?groupId=3`);
    const acts5A = await res5A.json();
    const foundIn5A = acts5A.some(a => a.id === created.activity_id);
    assert.equal(foundIn5A, false, 'Estudiante de 5A NO debe ver el taller de 4to');
});

test('Grade & Classroom Isolation - Specific classroom activity is only visible to that classroom', async () => {
    // Crear actividad exclusiva para Aula 4A (ID 1)
    const createRes = await fetch(`${baseUrl}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'Quiz 4A Exclusivo Test',
            type: 'Quiz',
            theme: 'Grado 4',
            grade: '4',
            group_id: 1,
            target_groups: [1]
        })
    });

    const created = await createRes.json();
    assert.equal(createRes.status, 200);

    // Visible para 4A
    const res4A = await fetch(`${baseUrl}/api/activities?groupId=1`);
    const acts4A = await res4A.json();
    assert.ok(acts4A.some(a => a.id === created.activity_id), 'Visible para 4A');

    // Oculto para 4B (ID 2)
    const res4B = await fetch(`${baseUrl}/api/activities?groupId=2`);
    const acts4B = await res4B.json();
    assert.ok(!acts4B.some(a => a.id === created.activity_id), 'Oculto para 4B');
});
