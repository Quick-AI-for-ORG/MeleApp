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
        const by = req.body.sensorType == undefined ? "_id" : "sensorType";
        const result = await Sensor.get(req.body.sensorType == undefined ? req.body._id : req.body.sensorType, by);
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

const getSensorReading = async (req, res) => {
    try {
        let result = await Sensor.get(req.body.sensorType);
        if (!result.success.status) return res.json(result.toJSON());
        const sensor = jsonToObject(result.data);
        result = await sensor.getReadings();
        if(result.success.status) {
            sensor.readings = sensor.readings.map(reading => new Reading(reading))
            result.data = sensor
        }
        return res.json(result.toJSON())
    } catch (error) {
        return res.json(new Result(-1, null, `Error fetching sensor readings: ${error.message}`).toJSON());
    }
}

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

const getReadings = async (req, res) => {
    try {
        const result = await Reading.getAll();
        req.session.readings = result.data || [];
        return res.json(result.toJSON())
    } catch (error) {
        return res.json(new Result(-1, null, `Error fetching readings: ${error.message}`).toJSON())
    }
}

const getSortedReadings = async (req, res) => {
    try {
        const sortBy = req.body.sortBy || { createdAt: -1 };
        const limit = req.body.limit || 10;
        const result = await Reading.getAll(sortBy, limit);
        req.session.readings = result.data || [];
        return result.toJSON()
    } catch (error) {
        return new Result(-1, null, `Error fetching sorted readings: ${error.message}`).toJSON()
    }
}

const getReadingsCount = async (req, res) => {
    try {
        const result = await Reading.count();
        req.session.stats.readings = result.data || 0
        return result.toJSON()
    } catch (error) {
        return new Result(-1, null, `Error fetching reading count: ${error.message}`).toJSON()
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
    getSensorReading,
    addSensorReading,
    getReadings,
    getSortedReadings,
    getReadingsCount
}