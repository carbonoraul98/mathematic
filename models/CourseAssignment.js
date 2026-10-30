const mongoose = require('mongoose');
const { getNextSequence } = require('./Counter');

const courseAssignmentSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    group_id: { type: Number, required: true },
    subject_id: { type: Number, required: true },
    teacher_id: { type: Number, required: true },
    created_at: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

courseAssignmentSchema.index({ group_id: 1, subject_id: 1, teacher_id: 1 }, { unique: true });

courseAssignmentSchema.pre('save', async function() {
    if (this.isNew && (this.id === undefined || this.id === null)) {
        this.id = await getNextSequence('course_assignments');
    }
});

module.exports = mongoose.models.CourseAssignment || mongoose.model('CourseAssignment', courseAssignmentSchema);

