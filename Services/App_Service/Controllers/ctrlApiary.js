const Apiary = require('../Models/Apiary');
const Result = require("../../Shared/Result");

const jsonToObject = (json) => {
    return new Apiary(json)
}
const addApiary = async (req, res) => {
    try {
        const apiaryJSON = {
            name: req.body.apiaryName,
            location: req.body.location || `${req.body.latitude} - ${req.body.longitude}`,
            numberOfHives: req.body.numberOfHives || 0,
            owner: req.body.owner || req.session.user._id
        };
        const apiary = jsonToObject(apiaryJSON);
        const result = await apiary.create();
        return result;
    } catch (error) {
        return new Result(-1, null, `Error creating apiary: ${error.message}`);
    }
}

const removeApiary = async (req, res) => {
    try {
        const result = await Apiary.remove(req.body._id);
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error deleting apiary: ${error.message}`).toJSON());
    }
}

const updateApiary = async (req, res) => {
    try {
        let update = {};
       Apiary.attributes.forEach(attr => {
            if (req.body.hasOwnProperty(attr)) {
                update[attr] = req.body[attr];
            }
        });
        const result = await Apiary.modify(update);
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error updating apiary: ${error.message}`).toJSON());
    }
}

const getApiary = async (req, res) => {
    try {
        const result = await Apiary.get(req.body._id);
        return result
    } catch (error) {
        return new Result(-1, null, `Error fetching apiary: ${error.message}`)
    }
}

const getApiaries = async (req, res) => {
    try {
        const result = await Apiary.getAll();
        req.session.apiaries = result.data || [];
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching apiaries: ${error.message}`).toJSON();
    }
}

const getApiaryHives = async (req, res) => {
    try {
        const apiary = await Apiary.get(req.body.apiary);
        if(apiary.success.status) return apiary.toJSON();
        const result = await Apiary.getHives(apiary._id);
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching apiary hives: ${error.message}`).toJSON();
    }
}
const getApiaryTemperature = async (req, res) => {}
const getApiaryHumidity = async (req, res) => {}

module.exports = {
    _jsonToObject: jsonToObject,
    addApiary,
    removeApiary,
    updateApiary,
    getApiary,
    getApiaries,
    getApiaryHives,
}