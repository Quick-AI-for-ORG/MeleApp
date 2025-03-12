const Hive = require('../Models/Hive');
const Result = require("../../Shared/Result");

const addHive = async (req, res) => {
    try {
        const hiveJSON = {
            dimensions: req.body.dimensions,
            numberOfFrames: req.body.numberOfFrames,
            streamUrl: req.body.streamUrl,
            apiaryRef: req.body.apiaryRef
        };
        const hive = new Hive(hiveJSON);
        const result = await hive.create();
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error creating hive: ${error.message}`).toJSON());
    }
}

const removeHive = async (req, res) => {
    try {
        const result = await Hive.remove(req.body._id);
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
        const result = await Hive.get(req.body._id);
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error fetching hive: ${error.message}`).toJSON());
    }
}

const getHives = async (req, res) => {
    try {
        const result = await Hive.getAll();
        req.session.hives = result.data || [];
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error fetching hives: ${error.message}`).toJSON());
    }
}

const getHiveTemperature = async (req, res) => {}
const getHiveHumidity = async (req, res) => {}
const getHiveWeight = async (req, res) => {}
const getFramesWeight = async (req, res) => {}
const watchLivestream = async (req, res) => {}
const getHiveUpgrade = async (req, res) => {}
const upgradeHive = async (req, res) => {}
const assignKeeper = async (req, res) => {}
const getAssignedKeeper = async (req, res) => {}
const closeDoor = async (req, res) => {}
const openDoor = async (req, res) => {}
const getDoorStatus = async (req, res) => {}
const turnOnCooler = async (req, res) => {}
const turnOffCooler = async (req, res) => {}
const getAnaomaly = async (req, res) => {} 

module.exports = {
    addHive,
    removeHive,
    updateHive,
    getHive,
    getHives,
    getHiveTemperature,
    getHiveHumidity,
    getHiveWeight,
    getFramesWeight,
    watchLivestream,
    getHiveUpgrade,
    upgradeHive,
    assignKeeper,
    getAssignedKeeper,
    closeDoor,
    openDoor,
    getDoorStatus,
    turnOnCooler,
    turnOffCooler,
    getAnaomaly
}