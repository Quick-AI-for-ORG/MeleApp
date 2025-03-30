const Capture = require("../Models/capture");

const jsonToObject = (json) => {
    return new Capture(json);
    }

const addCapture = async (req, res) => {
    try{
        const captureJSON = {
            hiveRef: req.body.hiveRef,
            image: req.body.image
        };
        const capture = jsonToObject(captureJSON);
        const result = await capture.create();
        return res.json(result.toJSON());
    }
    catch(error){
        return res.json(new Result(-1, null, `Error creating capture: ${error.message}`).toJSON());
    }


}

module.exports = {
    addCapture,
};