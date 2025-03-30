const Threat = require('../Models/Threat')
const Result = require("../../Shared/Result")

const jsonToObject = (json) => {
    return new Threat(json)
}
const addThreat = async (req, res) => {
    try {
        const threatJSON = {
            threatType: req.body.threatType,
            hiveRef: req.body.hiveRef,
            severity: req.body.severity || 0,
            description: req.body.description || "NA",
            action: req.body.action || "NA"
        };
        const threat = jsonToObject(threatJSON)
        const result = await threat.create()
        return res.json(result.toJSON())
    } catch (error) {
        return res.json(new Result(-1, null, `Error creating threat: ${error.message}`).toJSON())
    }
}

const removeThreat = async (req, res) => {
    try {
        const result = await Threat.remove(req.body._id)
        return res.json(result.toJSON())
    } catch (error) {
        return res.json(new Result(-1, null, `Error deleting threat: ${error.message}`).toJSON())
    }
}

const getThreat = async (req, res) => {
    try {
        const result = await Threat.get(req.body._id)
        return res.json(result.toJSON())
    } catch (error) {
        return res.json(new Result(-1, null, `Error getting threat: ${error.message}`).toJSON())
    }
}

const getAllThreats = async (req, res) => {
    try {
        const result = await Threat.getAll()
        return res.json(result.toJSON())
    } catch (error) {
        return res.json(new Result(-1, null, `Error getting all threats: ${error.message}`).toJSON())
    }
}

const modifyThreat = async (req, res) => {
    try {
        let update = {};
        Threat.attributes.forEach(attr => {
            if (req.body.hasOwnProperty(attr)) {
                update[attr] = req.body[attr];
            }
        });
        const threat = jsonToObject(update)
        const result = await threat.modify(threatJSON)
        return res.json(result.toJSON())
    } catch (error) {
        return res.json(new Result(-1, null, `Error modifying threat: ${error.message}`).toJSON())
    }
}

module.exports = {
    addThreat,
    removeThreat,
    getThreat,
    getAllThreats,
    modifyThreat
}
