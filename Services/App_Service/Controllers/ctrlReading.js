const Reading = require("../Models/Reading")
const Result = require('../../Shared/Result')

const controllers = {
    sensor: require("./ctrlSensor")
}

const jsonToObject = (json) => {
    return new Reading(json)
}


const addReading = async (req, res) => {
    try {
        const sensor = await controllers.sensor.getSensor(req,res);
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

const removeReading = async (req, res) => {
    try{
        const id = req.query._id || req.body._id
        const result = await Reading.remove(id)
        return res.json(result.toJSON())
    } catch (error) {
        return res.json(new Result(-1, null, `Error removing reading: ${error.message}`).toJSON());
    }
}

const getReading = async (req, res) => {
    try{
        const id = req.query._id || req.body._id
        const result = await Reading.get(id)
        if(result.success.status) result.data = new Reading(result.data)
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error saving reading: ${error.message}`).toJSON();
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

const getSensorReading = async (req, res) => {
    try {
        let result = await controllers.sensor.getSensor(req,res);
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


module.exports = {
    _jsonToObject: jsonToObject,
    addReading,
    removeReading,
    getReading,
    getReadings,
    getSortedReadings,
    getReadingsCount,
    getSensorReading
}