const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minLength: 10,
        trim: true
    },
    description: {
        type: String,
        required: true,
        minLength: 40,
        trim: true
    },
    openForFeedback: {
        type: Boolean,
        required: true
    },
    feedbackDeadline: {
        type: Date,
        required: true
    }
});

const Topic = mongoose.model('Topic', TopicSchema);

module.exports = { Topic }
