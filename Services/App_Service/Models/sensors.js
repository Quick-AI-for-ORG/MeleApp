const mongoose = require('mongoose');
const sensorSchema = new mongoose.Schema({
    sensorType: {
        type: String,
        required: true,
        unique: true,
    },
}, { timestamps: true });