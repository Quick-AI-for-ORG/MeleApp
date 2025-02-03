const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");

class Threat {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static attributes = ['threatType', 'hiveRef', 'action'];

  constructor(threatJSON) {
    Threat.jsonToObject(this, threatJSON);
  }

  static async get(id) {
    const result = await Threat.crudInterface.get(id, "threatModel", "_id");
    if (result.success.status) {
      result.data = new Threat(result.data);
    }
    return result;
  }

  static async getAll() {
    const result = await Threat.crudInterface.getAll("threatModel");
    if (result.success.status) {
      result.data = result.data.map(threat => new Threat(threat));
    }
    return result;
  }

  static async remove(id) {
    return await Threat.crudInterface.remove(id, "threatModel", "_id");
  }

  async create() {
    const result = await Threat.crudInterface.create(this, "threatModel", "_id");
    if (result.success.status) {
      result.data = Threat.jsonToObject(this, result.data);
    }
    return result;
  }

  async modify(newThreat) {
    const result = await Threat.crudInterface.modify(this._id, newThreat, "threatModel", "_id");
    if (result.success.status) {
      result.data = Threat.jsonToObject(this, result.data);
    }
    return result;
  }

  async remove() {
    return await Threat.crudInterface.remove(this._id, "threatModel", "_id");
  }
}

module.exports = Threat;
