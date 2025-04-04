const Sensor = require('../Models/Sensor');
const Result = require("../../Shared/Result");


const jsonToObject = (json) => {
    return new Sensor(json)
}

const addSensor = async (req, res) => {
    try {
        const sensorJSON = {
            sensorType: req.body.sensorType,
            description: req.body.description,
            status: req.body.status || 'inactive',
            modelName: req.body.modelName || '',
            imagePath: req.body.imagePath
        }
        const sensor = jsonToObject(sensorJSON)
        const result = await sensor.create();
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error creating sensor: ${error.message}`).toJSON());
    }
}

const removeSensor = async (req, res) => {
    try {
        const sensorType = req.body.sensorType || req.query.sensorType;
        const result = await Sensor.remove(sensorType)
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error deleting sensor: ${error.message}`).toJSON());
    }
}

const updateSensor = async (req, res) => {
    try {
        let update = {}
        Sensor.attributes.forEach(attr => {
            if (req.body.hasOwnProperty(attr)) {
                update[attr] = req.body[attr];
            }
        });
        const result = await Sensor.modify(update);
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error updating sensor: ${error.message}`).toJSON());
    }
}

const getSensor = async (req, res) => {
    try {
        const by = req.body.sensorType == undefined ? "_id" : "sensorType";
        const result = await Sensor.get(req.body.sensorType == undefined ? req.body._id : req.body.sensorType, by);
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching sensor: ${error.message}`).toJSON();
    }
}

const getSensors = async (req, res) => {
    try {
        const result = await Sensor.getAll();
        req.session.sensors = result.data || [];
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching sensors: ${error.message}`).toJSON();
    }
}

const getSortedSensors = async (req, res) => {
    try {
        const sortBy = req.body.sortBy || {createdAt: -1};
        const limit = req.body.limit || 10;
        const result = await Sensor.getAll(sortBy, limit);
        req.session.sensors = result.data || [];
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching sensors: ${error.message}`).toJSON();
    }
}

const getSensorsCount = async (req, res) => {
    try {
        const result = await Sensor.count();
        req.session.stats.sensors = result.data || 0
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching sensor count: ${error.message}`).toJSON();
    }
}

module.exports = {
    _jsonToObject: jsonToObject,
    addSensor,
    removeSensor,
    updateSensor,
    getSensor,
    getSensors,
    getSensorsCount,
    getSortedSensors,
}