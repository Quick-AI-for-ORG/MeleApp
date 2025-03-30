const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");
const dependency = require("../Utils/Dependency");

class Threat {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static dependency = dependency;
  static attributes = ['threatType', 'hiveRef', 'action', 'severity', 'description'];

  constructor(threatJSON) {
    Threat.jsonToObject(this, threatJSON);
    this.references = {
      parent: {
        "hiveModel": this.hiveRef
      }
    }
  }

  static async get(id) {
    const result = await Threat.crudInterface.get(id, "threatModel", "_id");
    if (result.success.status) {
      result.data = new Threat(result.data);
    }
    return result;
  }

  static async getAll(sortBy = null, limit = null) {
    let result = null;
    if (sortBy || limit) result = await Threat.crudInterface.getAllSorted("threatModel", sortBy, limit);
    else result = await Threat.crudInterface.getAll("threatModel");
    if (result.success.status) {
      result.data = result.data.map(threat => new Threat(threat));
    }
    return result;
  }

  static async remove(id) {
    return await Threat.crudInterface.remove(id, "threatModel", "_id");
  }

  static async count() {
    const result = await Threat.crudInterface.getCount("threatModel");
    return result;
  }

  async create() {
    const valid = await Threat.dependency.validate(this.references.parent, this);
    if (!valid.success.status) return valid;
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
