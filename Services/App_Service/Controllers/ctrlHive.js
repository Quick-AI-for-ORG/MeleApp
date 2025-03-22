const Hive = require('../Models/Hive');
const Result = require("../../Shared/Result");

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

const getThreats = async (req, res) => {
    try {
        const result = await Hive.getThreats(req.body._id);
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error fetching hive threats: ${error.message}`).toJSON());
    }
}



module.exports = {
    _jsonToObject: jsonToObject,
    addHive,
    removeHive,
    updateHive,
    getHive,
    getHives,
    getThreats
}