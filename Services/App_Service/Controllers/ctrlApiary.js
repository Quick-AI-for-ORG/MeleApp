const Apiary = require('../Models/Apiary');
const Result = require("../../Shared/Result");

const weatherService = require("../Utils/weatherService");

const jsonToObject = (json) => {
    return new Apiary(json)
}
const addApiary = async (req, res) => {
    try {
        const apiaryJSON = {
            name: req.body.apiaryName,
            location: req.body.location ||{ latitude:req.body.latitude, longitude: req.body.longitude},
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
        const id = req.query._id || req.body._id;
        const result = await Apiary.remove(id);
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
        let result = await Apiary.get(req.body._id);
        if(!result.success.status) return result.toJSON();
        const apiary = jsonToObject(result.data);
        result = await apiary.getHives(apiary._id);
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching apiary hives: ${error.message}`).toJSON();
    }
}

const getSortedApiaries = async (req, res) => {
    try {
        const sortBy = req.body.sortBy || {createdAt: -1};
        const limit = req.body.limit || 10;
        const result = await Apiary.getAll(sortBy, limit);
        req.session.apiaries = result.data || [];
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching sorted apiaries: ${error.message}`).toJSON();
    }
}

const updateForecast = async (req, res) => {
    try {
        let result = await Apiary.get(req.body._id);
        if(!result.success.status) return result
        const apiary = jsonToObject(result.data);
        result = await weatherService.getWeatherData(apiary.location.latitude, apiary.location.longitude);
        if(!result.success.status) return res.json(result.toJSON())
        result = await apiary.updateForecast(result.data.temperature, result.data.humidity);
        return res.json(result.toJSON());
    } catch (error) {
       return res.json(new Result(-1, null, `Error updating forecast: ${error.message}`).toJSON())
    }
}

const getApiariesCount = async (req, res) => {
    try {
        const result = await Apiary.count();
        req.session.stats.apiaries = result.data || 0
        return result.toJSON()
    } catch (error) {
        return new Result(-1, null, `Error fetching apiary count: ${error.message}`).toJSON()
    }
}

module.exports = {
    _jsonToObject: jsonToObject,
    addApiary,
    removeApiary,
    updateApiary,
    getApiary,
    getApiaries,
    getApiaryHives,
    getSortedApiaries,
    updateForecast,
    getApiariesCount
}