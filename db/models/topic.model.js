const mongoose = require('mongoose');

// Todo: maybe add a date field to make topics sortable
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

// This is used as some kind of cascade delte or garbage collection
TopicSchema.post('findOneAndDelete', (topic) => {
    // We need to retrieve the model in here to be able to call it's functions properly
    const { Feedback } = require('./feedback.model');
    // Delte all the related feedback entries
    Feedback.deleteMany({_topicId: topic._id}).exec();
})

const Topic = mongoose.model('Topic', TopicSchema);

module.exports = { Topic }
