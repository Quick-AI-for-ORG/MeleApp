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
    description: {
        type: String,
        required: true,
    },
    imagePath: {
        type: String,
        required: true,
    },
    modelName: {
        type: String,
        required: true,
    },
}, { timestamps: true });
module.exports = mongoose.model('Sensors', sensorSchema);

