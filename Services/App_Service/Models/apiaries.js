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
        type: Number,
    },
    humidity: {
        type: Number,   
    },
    numberOfHives: {
        type: Number,
        required: true,
    },

},{timestamps: true});

module.exports = mongoose.model('Apiary', apiarySchema);