const mongoose = require('mongoose');
const threatsSchema = new mongoose.Schema({
    threatType : {
        type: String,
        required: true,
    },
    hiveRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hives',
    },
    action: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Threats', threatsSchema);