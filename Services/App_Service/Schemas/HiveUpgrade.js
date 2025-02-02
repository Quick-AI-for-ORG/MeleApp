const mongoose = require('mongoose');
const upgradeSchema = new mongoose.Schema({
    hiveRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hives',
        required: true,
    },
    upgradeRef: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Upgrades',
        required: true,
    }],
}, { timestamps: true });

module.exports = mongoose.model('HiveUpgrades', upgradeSchema);