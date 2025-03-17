const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    subscription: {
        type: String,
        required: false,
    },
    images: {
        type: [String],
        default : []
        
    },
    counter: {
        type: Number,
        default: 0
    },
    sensors: {
        type:[mongoose.Schema.Types.ObjectId],
        ref: 'Sensors',
        default: [],
    }
}, { timestamps: true });
module.exports = mongoose.model('Products', productSchema);