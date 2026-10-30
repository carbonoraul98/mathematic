require('dotenv').config();
const mongoose = require('mongoose');

const Teacher = require('./Teacher');
const Group = require('./Group');
const Student = require('./Student');
const Activity = require('./Activity');
const Question = require('./Question');
const Attempt = require('./Attempt');
const Subject = require('./Subject');
const CourseAssignment = require('./CourseAssignment');
const { Counter } = require('./Counter');

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('⚠️ Advertencia: No se encontró la variable MONGODB_URI en el entorno.');
}

const connectionPromise = mongoose.connect(uri)
    .then(async () => {
        console.log(' Conectado exitosamente a MongoDB');
        // Inicializar superadmin y admin/docente por defecto
        try {
            // 1. Super Admin: superU
            const superU = await Teacher.findOne({ username: { $regex: /^superu$/i } });
            if (!superU) {
                await Teacher.create({
                    full_name: 'Super Usuario',
                    username: 'superU',
                    password: '12345',
                    role: 'superadmin',
                    is_admin: true
                });
                console.log(' SuperAdmin creado (superU)');
            } else if (superU.role !== 'superadmin' || !superU.is_admin) {
                superU.role = 'superadmin';
                superU.is_admin = true;
                await superU.save();
            }

            // 2. Docente inicial (Jorge Pajon)
            const jorge = await Teacher.findOne({ username: { $regex: /^jorge\s*pajon$/i } });
            if (!jorge) {
                await Teacher.create({
                    full_name: 'Jorge Pajon',
                    username: 'Jorge Pajon',
                    password: '1234',
                    role: 'docente',
                    is_admin: false
                });
                console.log(' Docente por defecto creado (Jorge Pajon)');
            } else if (!jorge.role) {
                jorge.role = 'docente';
                await jorge.save();
            }

            // 3. Materia inicial (Matemáticas)
            const existingSubject = await Subject.findOne({ name: { $regex: /^matem[aá]ticas$/i } });
            if (!existingSubject) {
                await Subject.create({
                    name: 'Matemáticas',
                    description: 'Materia base del sistema'
                });
                console.log(' Materia por defecto creada (Matemáticas)');
            }
        } catch (seedErr) {
            console.error('Error inicializando superU/docente/materia:', seedErr.message);
        }
    })
    .catch(err => {
        console.error('❌ Error al conectar con MongoDB:', err.message);
    });

module.exports = {
    mongoose,
    connectionPromise,
    Teacher,
    Group,
    Student,
    Activity,
    Question,
    Attempt,
    Subject,
    CourseAssignment,
    Counter
};
