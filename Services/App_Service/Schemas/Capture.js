const mongoose = require('mongoose');

const captureSchema = new mongoose.Schema({
    hiveRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hives',
        required: true,
    },
    imagePath: {
        type: String,
        required: true,
    },
    prediction: {
        type: String,
    },
    frameNum: {
        type: Number,
    },
    image: {
        type: [Number],
        default: [],
    }
}, { timestamps: true });
module.exports = mongoose.model('Captures', captureSchema);

