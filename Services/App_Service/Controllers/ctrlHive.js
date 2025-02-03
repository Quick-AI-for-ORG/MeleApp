const Hive = require('../Models/Hive');

const addHive = async (req, res) => {
    const hiveJSON = {
        dimensions: req.body.dimensions,
        numberOfFrames: req.body.numberOfFrames,
        streamUrl: req.body.streamUrl,
        apiaryRef:req.body.apiaryRef
    }
    const hive = new Hive(hiveJSON);
    const result = await hive.create(req.body);
    res.status(result.success.status ? 200 : 400).send(result);
}
const removeHive = async (req, res) => {
    const result = await Hive.remove(req.body.id);
    res.status(result.success.status ? 200 : 400).send(result);
}
const updateHive = async (req, res) => {}
const getHive = async (req, res) => {}
const getHives = async (req, res) => {}
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