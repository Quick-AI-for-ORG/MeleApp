const mongoose = require('mongoose');
const threatsSchema = require('./threats');
const dimensionSchema = new mongoose.Schema({
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
});

const frameSchema = new mongoose.Schema({
    weight: { type: Number, required: true },
    honeyYeild: { type: Number, required: true },
    vibration: { type: [Number], required: true },
});

const hiveSchema = new mongoose.Schema({
    dimentions: {
        type: dimensionSchema,
        required: true,
    },
    frames: {
        type: [frameSchema],
    },
    streamUrl: {
        type: String,

    },
    threats: {
        type: [{type: mongoose.Schema.Types.ObjectId, 
            ref: 'Threats'}],
    },

});

module.exports = mongoose.model('Hive', hiveSchema);