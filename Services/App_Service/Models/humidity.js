const mongoose =  require('mongoose');

const humiditySchema = new mongoose.Schema({
    _id: { 
        type: Date, 
        required: true,
        default: Date.now   

    }, 
    reading: { 
        type: String, 
        required: true 
    },

});

module.exports = mongoose.model('Humidity', humiditySchema);
    


