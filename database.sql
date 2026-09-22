-- Schema compatible con PostgreSQL y SQLite

-- Tabla de profesores
CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar admin por defecto (solo si no existe)
INSERT INTO teachers (full_name, username, password, is_admin) 
VALUES ('Jorge Pajon', 'Jorge Pajon', '1234', TRUE)
ON CONFLICT (username) DO NOTHING;

-- Tabla de grupos (hojas del Excel)
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT,
    teacher_name TEXT,
    month TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de estudiantes
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL,
    list_number INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    total_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id),
    UNIQUE(group_id, list_number)
);

-- Tabla de actividades
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    group_id INTEGER,
    title TEXT NOT NULL,
    type TEXT,
    theme TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de preguntas (para exámenes)
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice',
    options TEXT,
    correct_answer TEXT NOT NULL,
    points INTEGER DEFAULT 10,
    order_num INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id)
);

-- Tabla de calificaciones/intentos
CREATE TABLE IF NOT EXISTS attempts (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    activity_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (activity_id) REFERENCES activities(id)
);
