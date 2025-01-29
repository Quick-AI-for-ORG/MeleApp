const mongoose = require('mongoose');

const readingEntry = new mongoose.Schema({
    sensorRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sensor',
        required: true,
    },
    sensorValue: {
        type: Number,
        required: true,
    },
    hiveRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hive',
        required: true,
    },
    frameNum: {
        type: Number,
    
    },

}, { timestamps: true });

module.exports = mongoose.model('Reading', readingEntry);