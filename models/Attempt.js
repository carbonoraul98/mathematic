const mongoose = require('mongoose');
const { getNextSequence } = require('./Counter');

const attemptSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    student_id: { type: Number, required: true },
    activity_id: { type: Number, required: true },
    score: { type: Number, required: true },
    completed_at: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

attemptSchema.index({ student_id: 1, completed_at: -1 });

attemptSchema.pre('save', async function() {
    if (this.isNew && (this.id === undefined || this.id === null)) {
        this.id = await getNextSequence('attempts');
    }
});

module.exports = mongoose.models.Attempt || mongoose.model('Attempt', attemptSchema);
