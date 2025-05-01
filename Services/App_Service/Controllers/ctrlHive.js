const Hive = require('../Models/Hive');
const Result = require("../../Shared/Result");

const controllers = {
    reading: require("./ctrlReading"),
}

const jsonToObject = (json) => {
    return new Hive(json)
}
const addHive = async (req, res) => {
    try {
        const hiveJSON = {
            dimensions: {
                width: req.body.width,
                height: req.body.height,
                length: req.body.length
            },
            numberOfFrames: req.body.numberOfFrames,
            streamUrl: req.body.streamUrl || "NA",
            apiaryRef: req.body.apiaryRef
        };
        const hive = jsonToObject(hiveJSON);
        const result = await hive.create();
        return result.toJSON()
    } catch (error) {
        return new Result(-1, null, `Error creating hive: ${error.message}`).toJSON()
    }
}

const removeHive = async (req, res) => {
    try {
        const id = req.query._id || req.body._id;
        const result = await Hive.remove(id);
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error deleting hive: ${error.message}`).toJSON());
    }
}

const updateHive = async (req, res) => {
    try {
        let update = {};
        Hive.attributes.forEach(attr => {
            if (req.body.hasOwnProperty(attr)) {
                update[attr] = req.body[attr];
            }
        });
        const result = await Hive.modify(update);
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error updating hive: ${error.message}`).toJSON());
    }
}

const getHive = async (req, res) => {
    try {
        const id = req.query._id || req.body._id;
        const result = await Hive.get(id);
        if(req.session.isHardware){
            req.session.isHardware = false;
            return res.json(result.toJSON());
        }
        return result;
    } catch (error) {
        if(req.session.isHardware){
            req.session.isHardware = false;
            return res.json(new Result(-1, null, `Error fetching hive: ${error.message}`).toJSON());
        }
        return new Result(-1, null, `Error fetching hive: ${error.message}`);
    }
}

const getHives = async (req, res) => {
    try {
        const result = await Hive.getAll();
        if(result.success.status){
            for(let i = 0; i < result.data.length; i++){
                const hive = jsonToObject(result.data[i]);
                const apiary = await hive.getApiaryName();
                hive.apiaryName = apiary.data;
                result.data[i] = hive;
            }
        }
        req.session.hives = result.data || [];
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error fetching hives: ${error.message}`).toJSON());
    }
}

const getSortedHives = async (req, res) => {
    try {
        const sortBy = req.body.sortBy || {createdAt: -1};
        const limit = req.body.limit || 10;
        const result = await Hive.getAll(sortBy, limit);
        if(result.success.status){
            for(let i = 0; i < result.data.length; i++){
                const hive = jsonToObject(result.data[i]);
                const apiary = await hive.getApiaryName();
                hive.apiaryName = apiary.data;
                result.data[i] = hive;
            }
        }
        req.session.hives = result.data || [];
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching sorted hives: ${error.message}`).toJSON();
    }
}

const getHivesCount = async (req, res) => {
    try {
        const result = await Hive.count();
        req.session.stats.hives = result.data || 0
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching hive count: ${error.message}`).toJSON();
    }
}

const getReadings = async (req, res) => {
    try {
        let result = await getHive(req, res);
        if (!result.success.status) return res.json(result.toJSON());
        const hive = jsonToObject(result.data);
        result = await hive.getReadings();
        if (!result.success.status) return res.json(result.toJSON());
        hive.readings = result.data
        for (let i = 0; i < result.data.length; i++) {
            const reading = controllers.reading._jsonToObject(result.data[i]);
            const sensorType = await reading.getSensorType();
            reading.sensorType = sensorType.data
            hive.readings[i] = reading;
        }
        return res.json(new Result(1, hive, "Readings fetched successfully").toJSON())

    } catch (error) {
        return res.json(new Result(-1, null, `Error fetching readings: ${error.message}`).toJSON())
    }
}


const getSortedReadings = async (req,res) => {
    try {
        req.session.isHardware = false;
        let result = await getHive(req, res);
        if (!result.success.status) return res.json(result.toJSON());
        const hive = jsonToObject(result.data);
        result = await hive.getReadings(limit=req.body.limit ? req.body.limit : 7, type=req.body.sensor);
        if (!result.success.status) return res.json(result.toJSON());
        hive.readings = result.data
        for (let i = 0; i < result.data.length; i++) {
            const reading = controllers.reading._jsonToObject(result.data[i]);
            const sensorType = await reading.getSensorType();
            reading.sensorType = sensorType.data
            hive.readings[i] = reading;
        }
        return res.json(new Result(1, hive, "Readings fetched successfully").toJSON())
    } catch (error) {
        return res.json(new Result(-1, null, `Error fetching readings: ${error.message}`).toJSON())
    }
}



const getCaptures = async (req,res) => {
    try {
        let result = await getHive(req, res);
        if (!result.success.status) result.toJSON();
        const hive = jsonToObject(result.data);
        result = await hive.getCaptures();
        if (!result.success.status) result.toJSON();
        hive.captures = result.data
        req.session.captures = result.data || []
        return new Result(1, hive, "Captures fetched successfully").toJSON()
    } catch (error) {
        return new Result(-1, null, `Error fetching captures: ${error.message}`).toJSON()
    }
}


const openDoorStream = async (req, res) => {
    try {
        req.body._id = req.query.hiveId
        let result = await getHive(req, res);
        if (!result.success.status) return res.json(result.toJSON());
        const hive = jsonToObject(result.data);
        res.redirect(`http://${process.env.IP}:${hive.streamUrl}?user=${req.session.user._id}`);
    } catch (error) {
        return res.json(new Result(-1, null, `Error opening door stream: ${error.message}`).toJSON())
    }
}

module.exports = {
    _jsonToObject: jsonToObject,
    addHive,
    removeHive,
    updateHive,
    getHive,
    getHives,
    getSortedHives,
    getHivesCount,
    getReadings,
    getSortedReadings,
    getCaptures,
    openDoorStream,
}