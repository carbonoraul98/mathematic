const path = require('path');
const fs = require('fs');

let db;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')) {
    // PostgreSQL (Render)
    const { Pool } = require('pg');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    db = {
        async prepare(sql) {
            return {
                async run(...params) {
                    const result = await pool.query(sql, params);
                    return { changes: result.rowCount };
                },
                async get(...params) {
                    const result = await pool.query(sql, params);
                    return result.rows[0] || null;
                },
                async all(...params) {
                    const result = await pool.query(sql, params);
                    return result.rows;
                }
            };
        },
        async exec(sql) {
            await pool.query(sql);
        }
    };
    
    // Ejecutar schema
    const schema = fs.readFileSync(path.join(__dirname, '..', 'database.sql'), 'utf8');
    db.exec(schema).catch(console.error);
    
} else {
    // SQLite (desarrollo local)
    const Database = require('better-sqlite3');
    const sqlite = new Database('./database.sqlite');
    
    // Ejecutar schema
    const schema = fs.readFileSync(path.join(__dirname, '..', 'database.sql'), 'utf8');
    sqlite.exec(schema);
    
    // Wrapper para que SQLite sea compatible con async/await
    db = {
        async prepare(sql) {
            const stmt = sqlite.prepare(sql);
            return {
                async run(...params) {
                    return stmt.run(...params);
                },
                async get(...params) {
                    return stmt.get(...params);
                },
                async all(...params) {
                    return stmt.all(...params);
                }
            };
        },
        async exec(sql) {
            sqlite.exec(sql);
        }
    };
}

module.exports = db;
