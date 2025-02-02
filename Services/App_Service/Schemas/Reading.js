const mongoose = require('mongoose');

const readingEntry = new mongoose.Schema({
    sensorRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sensors',
        required: true,
    },
    sensorValue: {
        type: Number,
        required: true,
    },
    hiveRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hives',
        required: true,
    },
    frameNum: {
        type: Number,
    
    },

}, { timestamps: true });

module.exports = mongoose.model('Readings', readingEntry);