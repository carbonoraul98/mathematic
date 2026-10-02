const mongoose = require('mongoose');
const { getNextSequence } = require('./Counter');

const studentSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    group_id: { type: Number, required: true },
    list_number: { type: Number, required: true },
    full_name: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    total_score: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

studentSchema.index({ group_id: 1, list_number: 1 }, { unique: true });

studentSchema.pre('save', async function() {
    if (this.isNew && (this.id === undefined || this.id === null)) {
        this.id = await getNextSequence('students');
    }
});

module.exports = mongoose.models.Student || mongoose.model('Student', studentSchema);
