const mongoose = require('mongoose');
const threatsSchema = require('./threats');
const dimensionSchema = new mongoose.Schema({
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
});

// const frameSchema = new mongoose.Schema({
//     weight: [{ type: Number, required: true }],
//     honeyYeild: [{ type: Number, required: true }],
//     vibration: [{ type: [Number], required: true }],
//     picture: [{ type: String}],
// }, timestamps = true);

const hiveSchema = new mongoose.Schema({
    dimentions: {
        type: dimensionSchema,
        required: true,
    },
    numberOfFrames: {
        type: Number,
        required: true,
    },
    streamUrl: {
        type: String,

    },
    apiaryRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apiary',
    },

}, { timestamps: true });

module.exports = mongoose.model('Hive', hiveSchema);