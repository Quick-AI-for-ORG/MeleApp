const Sensor = require('../Models/Sensor');

const addSensor = async (req, res) => {}
const removeSensor = async (req, res) => {}
const updateSensor = async (req, res) => {}
const getSensor = async (req, res) => {}
const getSensors = async (req, res) => {
    const result = await Sensor.getAll();
    req.session.sensors = result.data || [];
    return result.toJSON();
}
const getSensorReading = async (req, res) => {}


module.exports = {
    addSensor,
    removeSensor,
    updateSensor,
    getSensor,
    getSensors,
    getSensorReading
}