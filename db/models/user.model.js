const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        index:true,
        required: true,
        minLength: 5,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
        trim: true
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = { User }