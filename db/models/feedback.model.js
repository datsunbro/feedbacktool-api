const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    feedback: {
        type: String,
        required: true,
        minLength: 40,
        trim: true
    },
    _topicId: {
        type: mongoose.Types.ObjectId,
        required: true
    }
});

const Feedback = mongoose.model('Feedback', FeedbackSchema);

module.exports = { Feedback }