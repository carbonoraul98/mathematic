require('dotenv').config();
const mongoose = require('mongoose');

const Teacher = require('./Teacher');
const Group = require('./Group');
const Student = require('./Student');
const Activity = require('./Activity');
const Question = require('./Question');
const Attempt = require('./Attempt');
const { Counter } = require('./Counter');

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('⚠️ Advertencia: No se encontró la variable MONGODB_URI en el entorno.');
}

const connectionPromise = mongoose.connect(uri)
    .then(async () => {
        console.log(' Conectado exitosamente a MongoDB');
        // Inicializar admin por defecto si no existe
        try {
            const adminExists = await Teacher.findOne({ username: 'Jorge Pajon' });
            if (!adminExists) {
                await Teacher.create({
                    full_name: 'Jorge Pajon',
                    username: 'Jorge Pajon',
                    password: '1234',
                    is_admin: true
                });
                console.log(' Admin por defecto creado (Jorge Pajon)');
            }
        } catch (seedErr) {
            console.error('Error inicializando admin por defecto:', seedErr.message);
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
    Counter
};
