const mongoose = require('mongoose');
const { getNextSequence } = require('./Counter');

const groupSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    name: { type: String, required: true },
    code: { type: String },
    teacher_name: { type: String },
    month: { type: String },
    created_at: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

groupSchema.pre('save', async function() {
    if (this.isNew && (this.id === undefined || this.id === null)) {
        this.id = await getNextSequence('groups');
    }
});

module.exports = mongoose.models.Group || mongoose.model('Group', groupSchema);
