const mongoose = require('mongoose');
const humiditySchema = require('./humidity');
const temperatureSchema = require('./temperature');
const apiarySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    temperature: {
        type: [temperatureSchema],
    },
    humidity: {
        type: [humiditySchema],    
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Apiary', apiarySchema);