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
                    return { changes: result.rowCount, lastInsertRowid: result.rows[0]?.id };
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
    
    // Ejecutar schema PostgreSQL
    const schema = fs.readFileSync(path.join(__dirname, '..', 'database.sql'), 'utf8');
    db.exec(schema).catch(console.error);
    
} else {
    // SQLite (desarrollo local)
    const Database = require('better-sqlite3');
    const sqlite = new Database('./database.sqlite');
    
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
    
    // Ejecutar schema SQLite (adaptado)
    const sqliteSchema = `
        CREATE TABLE IF NOT EXISTS teachers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            is_admin BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        INSERT OR IGNORE INTO teachers (full_name, username, password, is_admin) VALUES
        ('Jorge Pajon', 'Jorge Pajon', '1234', 1);
        
        CREATE TABLE IF NOT EXISTS groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT,
            teacher_name TEXT,
            month TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL,
            list_number INTEGER NOT NULL,
            full_name TEXT NOT NULL,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            total_score INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id) REFERENCES groups(id),
            UNIQUE(group_id, list_number)
        );
        
        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER,
            title TEXT NOT NULL,
            type TEXT,
            theme TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            activity_id INTEGER NOT NULL,
            question_text TEXT NOT NULL,
            question_type TEXT DEFAULT 'multiple_choice',
            options TEXT,
            correct_answer TEXT NOT NULL,
            points INTEGER DEFAULT 10,
            order_num INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (activity_id) REFERENCES activities(id)
        );
        
        CREATE TABLE IF NOT EXISTS attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            activity_id INTEGER NOT NULL,
            score INTEGER NOT NULL,
            completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id),
            FOREIGN KEY (activity_id) REFERENCES activities(id)
        );
    `;
    sqlite.exec(sqliteSchema);
}

module.exports = db;
