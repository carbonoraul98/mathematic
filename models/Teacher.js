const mongoose = require('mongoose');
const { getNextSequence } = require('./Counter');

const teacherSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    full_name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    is_admin: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

teacherSchema.pre('save', async function() {
    if (this.isNew && (this.id === undefined || this.id === null)) {
        this.id = await getNextSequence('teachers');
    }
});

module.exports = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);
