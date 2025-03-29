const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    userRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
},{timestamps: true});

module.exports = mongoose.model('Questions', questionSchema);