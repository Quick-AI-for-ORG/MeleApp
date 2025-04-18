const mongoose = require('mongoose');
const upgradeSchema = new mongoose.Schema({
    hiveRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hives',
        required: true,
    },
    productRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true,
    },
    userRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    operational:{
        type: Boolean,
        required: true,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('HiveUpgrades', upgradeSchema);