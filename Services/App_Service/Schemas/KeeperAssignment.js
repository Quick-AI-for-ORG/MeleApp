const mongoose = require('mongoose');

const keeperAssignmentSchema = new mongoose.Schema({
    beekeeperRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    hiveRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hives',
        required: true,
    },
    apiaryRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apiaries',
        required: true,
    },
}, { timestamps: true });
    
module.exports = mongoose.model('KeeperAssignments', keeperAssignmentSchema);