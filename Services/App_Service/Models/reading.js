const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");
const dependency = require("../Utils/Dependency");


class Reading {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static dependency = dependency;
  static attributes = ['sensorRef', 'sensorValue', 'hiveRef', 'frameNum'];

  constructor(readingJSON) {
    Reading.jsonToObject(this, readingJSON);
    this.references = {
      parent: {
        "hiveModel": this.hiveRef,
        "sensorModel": this.sensorRef
      }
    }
  }

  static async get(id) {
    const result = await Reading.crudInterface.get(id, "readingModel", "_id");
    if (result.success.status) {
      result.data = new Reading(result.data);
    }
    return result;
  }

  static async getAll() {
    const result = await Reading.crudInterface.getAll("readingModel");
    if (result.success.status) {
      result.data = result.data.map(reading => new Reading(reading));
    }
    return result;
  }

  static async remove(id) {
    return await Reading.crudInterface.remove(id, "readingModel", "_id");
  }

  async create() {
    const valid = await Reading.dependency.validate(this.references.parent, this);
    if (!valid.success.status) return valid;
    const result = await Reading.crudInterface.create(this, "readingModel", "_id");
    if (result.success.status) {
      result.data = Reading.jsonToObject(this, result.data);
    }
    return result;
  }

  async modify(newReading) {
    const result = await Reading.crudInterface.modify(this._id, newReading, "readingModel", "_id");
    if (result.success.status) {
      result.data = Reading.jsonToObject(this, result.data);
    }
    return result;
  }

  async remove() {
    return await Reading.crudInterface.remove(this._id, "readingModel", "_id");
  }
}

module.exports = Reading;
