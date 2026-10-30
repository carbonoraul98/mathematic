const mongoose = require('mongoose');
const { getNextSequence } = require('./Counter');

const subjectSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '', trim: true },
    created_at: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

subjectSchema.pre('save', async function() {
    if (this.isNew && (this.id === undefined || this.id === null)) {
        this.id = await getNextSequence('subjects');
    }
});

module.exports = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);

