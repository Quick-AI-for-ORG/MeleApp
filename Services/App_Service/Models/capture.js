const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");
const dependency = require("../Utils/Dependency");


class Capture {
    static crudInterface = crudInterface;
    static jsonToObject = jsonToObject;
    static dependency = dependency;
    static attributes = ['hiveRef', 'imagePath', 'prediction', 'frameNum'];
    
    constructor(captureJSON) {
        Capture.jsonToObject(this, captureJSON);
        this.references = {
          parent: {
            "hiveModel": this.hiveRef,
          }
        }
    }
    static async get(id) {
        const result = await Capture.crudInterface.get(id, "captureModel", "_id");
        if (result.success.status) {
            result.data = new Capture(result.data);
        }
        return result;
    }
    static async getAll() {
        const result = await Capture.crudInterface.getAll("captureModel");
        if (result.success.status) {
            result.data = result.data.map(capture => new Capture(capture));
        }
        return result;
    }
    static async remove(id) {
        return await Capture.crudInterface.remove(id, "captureModel", "_id");
    }
    async create() {
        const valid = await Capture.dependency.validate(this.references.parent, this);
        if (!valid.success.status) return valid;
        const result = await Capture.crudInterface.create(this, "captureModel", "_id");
        if (result.success.status) {
            result.data = Capture.jsonToObject(this, result.data);
        }
        return result;
    }
    async modify(newCapture) {
        const result = await Capture.crudInterface.modify(this._id, newCapture, "captureModel", "_id");
        if (result.success.status) {
            result.data = Capture.jsonToObject(this, result.data);
        }
        return result;
    }
    async remove() {
        return await Capture.crudInterface.remove(this._id, "captureModel", "_id");
    }
}

module.exports = Capture;