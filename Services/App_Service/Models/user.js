const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        // default: 'user',
    },    
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    tel: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    affiliation: {
        type: String,
        required: true,
    },
},
    {timestamps: true}
);

module.exports = mongoose.model('User', userSchema);