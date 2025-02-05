const Sensor = require('../Models/Sensor');
const Result = require("../../Shared/Result");

const addSensor = async (req, res) => {
    try {
        const sensorJSON = {
            sensorType: req.body.sensorType,
            description: req.body.description,
            status: req.body.status || 'inactive',
            modelName: req.body.modelName || '',
            imagePath: req.body.imagePath
        }
        const sensor = new Sensor(sensorJSON)
        const result = await sensor.create();
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error creating sensor: ${error.message}`);
    }
}

const removeSensor = async (req, res) => {
    try {
        const result = await Sensor.remove(req.body.sensorType)
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error deleting sensor: ${error.message}`);
    }
}

const updateSensor = async (req, res) => {
    try {
        let update = {}
        Object.keys(Sensor.attributes).forEach(attr => {
            if (req.body.hasOwnProperty(attr)) {
                update[attr] = req.body[attr];
            }
        });
        const result = await Sensor.modify(update);
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error updating sensor: ${error.message}`);
    }
}

const getSensor = async (req, res) => {
    try {
        const result = await Sensor.get(req.body.sensorType);
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching sensor: ${error.message}`);
    }
}

const getSensors = async (req, res) => {
    try {
        const result = await Sensor.getAll();
        req.session.sensors = result.data || [];
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching sensors: ${error.message}`);
    }
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