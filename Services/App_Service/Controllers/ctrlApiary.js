const Apiary = require('../Models/Apiary');
const Result = require("../../Shared/Result");

const addApiary = async (req, res) => {
    try {
        const apiaryJSON = {
            name: req.body.name,
            location: req.body.location,
            temperature: req.body.temperature,
            humidity: req.body.humidity,
            numberOfHives: req.body.numberOfHives || 0,
            owner: req.body.owner
        };
        const apiary = new Apiary(apiaryJSON);
        const result = await apiary.create();
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error creating apiary: ${error.message}`);
    }
}

const removeApiary = async (req, res) => {
    try {
        const result = await Apiary.remove(req.body._id);
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error deleting apiary: ${error.message}`);
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
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error updating apiary: ${error.message}`);
    }
}

const getApiary = async (req, res) => {
    try {
        const result = await Apiary.get(req.body._id);
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching apiary: ${error.message}`);
    }
}

const getApiaries = async (req, res) => {
    try {
        const result = await Apiary.getAll();
        req.session.apiaries = result.data || [];
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching apiaries: ${error.message}`);
    }
}

const getApiaryHives = async (req, res) => {}
const getApiaryTemperature = async (req, res) => {}
const getApiaryHumidity = async (req, res) => {}

module.exports = {
    addApiary,
    removeApiary,
    updateApiary,
    getApiary,
    getApiaries,
    getApiaryHives,
    getApiaryTemperature,
    getApiaryHumidity
}