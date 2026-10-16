const mongoose = require('mongoose');
const { Counter, getNextSequence } = require('./Counter');

const activitySchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    group_id: { type: Number },
    target_groups: [{ type: Number }],
    title: { type: String, required: true },
    type: { type: String },
    theme: { type: String },
    is_training_level: { type: Boolean, default: false },
    training_grade: { type: String, default: '' },
    map_icon: { type: String, default: '🏆' },
    created_at: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

activitySchema.pre('save', async function() {
    if (this.isNew && (this.id === undefined || this.id === null)) {
        let nextId = await getNextSequence('activities');
        const ActivityModel = mongoose.models.Activity || mongoose.model('Activity');
        const maxDoc = await ActivityModel.findOne().sort({ id: -1 });
        if (maxDoc && nextId <= maxDoc.id) {
            nextId = maxDoc.id + 1;
            await Counter.findByIdAndUpdate('activities', { seq: nextId });
        }
        this.id = nextId;
    }
});

module.exports = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
