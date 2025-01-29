const mongoose = require('mongoose');
const hiveSchema = require('../hive');
const threatsSchema = new mongoose.Schema({
    threatType : {
        type: String,
        required: true,
    },
    hiveRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hive',
    },
    action: {
        type: String,
    },
}, { timestamps: true });

model.exports = mongoose.model('Threats', threatsSchema);