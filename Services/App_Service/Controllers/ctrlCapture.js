const Capture = require('../Models/Capture');
const Result = require("../../Shared/Result");

const axios = require("axios")
const jsonToObject = (json) => {
    return new Capture(json);
    }

const addCapture = async (req, res) => {
    try{
        const buffer = Buffer.from(req.body.image, 'base64');
        const captureJSON = {
        hiveRef: req.body.hiveRef,
        image: buffer,
        };
    



        const capture = jsonToObject(captureJSON);
        const result = await capture.create();
        return res.json(result.toJSON());
    }
    catch(error){
        return res.json(new Result(-1, null, `Error creating capture: ${error.message}`).toJSON());
    }

}
const removeCapture = async (req, res) => {
    try{
        const id = req.query._id || req.body._id;
        const result = await Capture.remove(id);
        return res.json(result.toJSON());
    }
    catch(error){
        return res.json(new Result(-1, null, `Error deleting capture: ${error.message}`).toJSON());
    }
}

const updateCapture = async (req, res) => {
    try{
        let update = {};
        Capture.attributes.forEach(attr => {
            if (req.body.hasOwnProperty(attr)) {
                update[attr] = req.body[attr];
            }
        });
        const result = await Capture.modify(update);
        return res.json(result.toJSON());
    }
    catch(error){
        return res.json(new Result(-1, null, `Error updating capture: ${error.message}`).toJSON());
    }
}
const getCapture = async (req, res) => {
    try{
        const result = await Capture.get(req.body._id);
        return result;
    }
    catch(error){
        return new Result(-1, null, `Error fetching capture: ${error.message}`);
    }
}

const getCaptures = async (req, res) => {
    try{
        const result = await Capture.getAll();
        req.session.captures = result.data || [];
        return result.toJSON();
    }
    catch(error){
        return new Result(-1, null, `Error fetching captures: ${error.message}`).toJSON();
    }
}
const getSortedCaptures = async (req, res) => {
    try{
        const sortBy = req.body.sortBy || {createdAt: -1};
        const limit = req.body.limit || 10;
        const result = await Capture.getAll(sortBy, limit);
        req.session.captures = result.data || [];
        return result.toJSON();
    }
    catch(error){
        return new Result(-1, null, `Error fetching captures: ${error.message}`).toJSON();
    }
}
const getCapturesCount = async (req, res) => {
    try{
        const result = await Capture.count();
        req.session.stats.capture = result.data || 0;
        return result.toJSON();
    }
    catch(error){
        return new Result(-1, null, `Error fetching capture count: ${error.message}`).toJSON();
    }
}


const getHoneyInspection = async (req,res) => {
    try{
        let result = await getCapture(req,res)
        if (!result.success.status) return res.json(result.toJSON())
        const capture = jsonToObject(result.data)
        const response = await axios.post(`http://${process.env.IP}:${process.env.FLASK_PORT}/${Capture.honeyInspectPath}`, 
            { image: capture.image }, 
            { headers: {'Content-Type': 'application/json'},}
        );
        result = response.data
        if (!result.success.status) return res.json(new Result(0, null, result.message).toJSON())
        return res.json(new Result(1, result.data, result.message).toJSON())
        
    }
    catch(error){
        return res.json(new Result(-1, null, `Error fetching predictions: ${error.message}`).toJSON())
    }
}

module.exports = {
    addCapture,
    removeCapture,
    updateCapture,
    getCapture,
    getCaptures,
    getSortedCaptures,
    getCapturesCount,
    getHoneyInspection
};