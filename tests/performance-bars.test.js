const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../server');
const { connectionPromise, mongoose, Student, Group, Activity, Attempt, Question } = require('../models/database');

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
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.disconnect();
});

test('Student Performance - Returns topic progress bars without ReferenceError', async () => {
    const student = await Student.findOne();
    assert.ok(student, 'Student should exist');

    const res = await fetch(`${baseUrl}/api/students/${student.id}/performance`);
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.topics), 'Topics should be an array');
    assert.ok(data.topics.length >= 3, 'Should have at least 3 categories (Multiplicación, División, Fracciones)');

    data.topics.forEach(t => {
        assert.ok(t.name);
        assert.ok(t.icon);
        assert.ok(t.color);
        assert.ok(typeof t.percentage === 'number');
        assert.ok(t.percentage >= 0 && t.percentage <= 100);
    });
});
