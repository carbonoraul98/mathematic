const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../server');
const { connectionPromise, mongoose, Student, Attempt } = require('../models/database');

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

test('Student Reset - Clears total_score, attempts, and returns level 1', async () => {
    const student = await Student.findOne();
    assert.ok(student, 'Student should exist');

    // Add XP first
    await Student.updateOne({ _id: student._id }, { total_score: 90 });
    await Attempt.create({
        student_id: student.id,
        activity_id: 1,
        score: 30
    });

    const res = await fetch(`${baseUrl}/api/students/${student.id}/reset`, {
        method: 'POST'
    });
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.total_score, 0);
    assert.equal(body.levelInfo.level, 1);
    assert.equal(body.levelInfo.currentXP, 0);

    const updatedStudent = await Student.findOne({ _id: student._id });
    assert.equal(updatedStudent.total_score, 0);

    const remainingAttempts = await Attempt.find({ student_id: student.id });
    assert.equal(remainingAttempts.length, 0);
});
