const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/grades', require('./routes/grades'));
app.use('/api/groups', require('./routes/groups'));

// Seed Practice Modules automatically if not present
const seedPractices = require('./seedPractices');
setTimeout(() => {
    seedPractices();
}, 2000); // Wait 2s for DB initialization

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
