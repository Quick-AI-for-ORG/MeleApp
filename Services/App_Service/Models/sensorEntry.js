const mongoose = require('mongoose');

const sensorEntriesSchema = new mongoose.Schema({
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
    frameRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Frame',
    },

}, { timestamps: true });

module.exports = mongoose.model('SensorEntry', sensorEntriesSchema);