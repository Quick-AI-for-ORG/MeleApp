const mongoose = require('mongoose');
const sensorSchema = new mongoose.Schema({
    sensorType: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        required: true,
    },
}, { timestamps: true });
module.exports = mongoose.model('Sensor', sensorSchema);
