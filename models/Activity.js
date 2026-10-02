const mongoose = require('mongoose');
const { getNextSequence } = require('./Counter');

const activitySchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    group_id: { type: Number },
    title: { type: String, required: true },
    type: { type: String },
    theme: { type: String },
    created_at: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

activitySchema.pre('save', async function() {
    if (this.isNew && (this.id === undefined || this.id === null)) {
        this.id = await getNextSequence('activities');
    }
});

module.exports = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
