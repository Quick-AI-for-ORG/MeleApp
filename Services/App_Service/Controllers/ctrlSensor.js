const Sensor = require('../Models/Sensor');
const Reading = require('../Models/Reading');
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
        const result = await Sensor.remove(req.body.sensorType)
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error deleting sensor: ${error.message}`).toJSON());
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
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error updating sensor: ${error.message}`).toJSON());
    }
}

const getSensor = async (req, res) => {
    try {
        const result = await Sensor.get(req.body.sensorType);
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error fetching sensor: ${error.message}`).toJSON());
    }
}

const getSensors = async (req, res) => {
    try {
        const result = await Sensor.getAll();
        req.session.sensors = result.data || [];
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error fetching sensors: ${error.message}`).toJSON());
    }
}

const getSensorReading = async (req, res) => {}

const addSensorReading = async (req, res) => {
    try {
        const sensor = await Sensor.get(req.body.sensorType);
        if (!sensor.success.status) return res.json(sensor.toJSON());
        const readingJSON = {
            sensorRef: sensor.data._id,
            sensorValue: req.body.sensorValue,
            hiveRef: req.body.hiveRef,
            frameNum: req.body.frameNum || null,
        }
        const reading = new Reading(readingJSON)
        const result = await reading.create();
        return res.json(result.toJSON())
    } catch (error) {
        return res.json(new Result(-1, null, `Error saving reading: ${error.message}`).toJSON());
    }
}

module.exports = {
    _jsonToObject: jsonToObject,
    addSensor,
    removeSensor,
    updateSensor,
    getSensor,
    getSensors,
    getSensorReading,
    addSensorReading
}