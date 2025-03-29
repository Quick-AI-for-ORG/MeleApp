const mongoose = require('mongoose');

const captureSchema = new mongoose.Schema({
    hiveRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hives',
        required: true,
    },
    imagePath: {
        type: String,
    },
    prediction: {
        type: String,
    },
    frameNum: {
        type: Number,
    },
    image: {
        type: Buffer,  
        required: true,
    }
}, { timestamps: true });
module.exports = mongoose.model('Captures', captureSchema);

