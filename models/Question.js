const mongoose = require('mongoose');
const { Counter, getNextSequence } = require('./Counter');

const questionSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    activity_id: { type: Number, required: true },
    question_text: { type: String, required: true },
    question_type: { type: String, default: 'multiple_choice' },
    options: { type: String }, // JSON stringified array matching existing format
    correct_answer: { type: String, required: true },
    points: { type: Number, default: 10 },
    order_num: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

questionSchema.index({ activity_id: 1, order_num: 1 });

questionSchema.pre('save', async function() {
    if (this.isNew && (this.id === undefined || this.id === null)) {
        let nextId = await getNextSequence('questions');
        const QuestionModel = mongoose.models.Question || mongoose.model('Question');
        const maxDoc = await QuestionModel.findOne().sort({ id: -1 });
        if (maxDoc && nextId <= maxDoc.id) {
            nextId = maxDoc.id + 1;
            await Counter.findByIdAndUpdate('questions', { seq: nextId });
        }
        this.id = nextId;
    }
});

module.exports = mongoose.models.Question || mongoose.model('Question', questionSchema);
