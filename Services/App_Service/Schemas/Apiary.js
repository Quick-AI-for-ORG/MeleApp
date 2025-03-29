const mongoose = require('mongoose');
const locationSchema = new mongoose.Schema({
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
});
const apiarySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: locationSchema,
        required: true
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
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },

},{timestamps: true});

module.exports = mongoose.model('Apiaries', apiarySchema);