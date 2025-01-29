const mongoose = require('mongoose');

const keeperAssignmentSchema = new mongoose.Schema({
    beekeeperRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    hiveRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hive',
        required: true,
    },
    apiaryRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apiary',
        required: true,
    },
}, { timestamps: true });
    
module.exports = mongoose.model('KeeperAssignment', keeperAssignmentSchema);