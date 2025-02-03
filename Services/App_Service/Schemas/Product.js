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
        required: true,
    },
    images: {
        type: [String],
        default : []
        
    },
    counter: {
        type: Number,
        default: 0
    }
}, { timestamps: true });
module.exports = mongoose.model('Products', productSchema);