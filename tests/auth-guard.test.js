const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../server');
const { connectionPromise, mongoose } = require('../models/database');

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

async function postJson(endpoint, data) {
    const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body };
}

test('Teacher Auth Guard - Exact credentials (Jorge Pajon / 1234)', async () => {
    const res = await postJson('/api/teachers/login', {
        username: 'Jorge Pajon',
        password: '1234'
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.teacher);
});

test('Teacher Auth Guard - Lowercase username (jorge pajon / 1234)', async () => {
    const res = await postJson('/api/teachers/login', {
        username: 'jorge pajon',
        password: '1234'
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
});

test('Teacher Auth Guard - Whitespace trimmed username & password ("  jorge pajon  " / "  1234  ")', async () => {
    const res = await postJson('/api/teachers/login', {
        username: '  jorge pajon  ',
        password: '  1234  '
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
});

test('Teacher Auth Guard - Alias admin ("admin" / "1234")', async () => {
    const res = await postJson('/api/teachers/login', {
        username: 'admin',
        password: '1234'
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
});

test('Teacher Auth Guard - Alias jorge ("jorge" / "1234")', async () => {
    const res = await postJson('/api/teachers/login', {
        username: 'jorge',
        password: '1234'
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
});

test('Teacher Auth Guard - Reject invalid password', async () => {
    const res = await postJson('/api/teachers/login', {
        username: 'Jorge Pajon',
        password: 'incorrect_password'
    });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
});

test('Teacher Auth Guard - Reject missing credentials', async () => {
    const res = await postJson('/api/teachers/login', {
        username: '',
        password: ''
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
});

test('Student Auth Guard - Exact credentials (gaelacosta / 123)', async () => {
    const res = await postJson('/api/students/login', {
        username: 'gaelacosta',
        password: '123'
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.student);
});

test('Student Auth Guard - Case insensitive (Gaelacosta / 123)', async () => {
    const res = await postJson('/api/students/login', {
        username: 'Gaelacosta',
        password: '123'
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
});

test('Student Auth Guard - Uppercase mobile keyboard (GAELACOSTA / 123)', async () => {
    const res = await postJson('/api/students/login', {
        username: 'GAELACOSTA',
        password: '123'
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
});

test('Student Auth Guard - Whitespace trimmed username & password ("  gaelacosta  " / "  123  ")', async () => {
    const res = await postJson('/api/students/login', {
        username: '  gaelacosta  ',
        password: '  123  '
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
});

test('Student Auth Guard - Reject invalid password', async () => {
    const res = await postJson('/api/students/login', {
        username: 'gaelacosta',
        password: 'bad_password'
    });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
});

test('Student Auth Guard - Reject missing credentials', async () => {
    const res = await postJson('/api/students/login', {
        username: '',
        password: ''
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
});
