const mongoose = require('mongoose');
const upgradeSchema = new mongoose.Schema({
    userRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    productRef: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true,
    }],
}, { timestamps: true });

module.exports = mongoose.model('Upgrades', upgradeSchema);