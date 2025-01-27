const mongoose = require('mongoose');
const hiveSchema = require('../hive');
const threatsSchema = new mongoose.Schema({
    threatType : {
        type: String,
        required: true,
    },
    timeStamp : {
        type: Date,
        default: Date.now,
    },
    hiveRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hive',
    },
});

model.exports = mongoose.model('Threats', threatsSchema);