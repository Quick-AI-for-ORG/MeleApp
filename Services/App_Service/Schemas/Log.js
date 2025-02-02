const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    log: {
        type: String,
        required: true,
    },
    degree: {
        type: Number,
        required: true,
    },
},{timestamps: true});

module.exports = mongoose.model('Logs', logSchema);