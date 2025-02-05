const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");
const dependency = require("../Utils/Dependency");
class Hive {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static dependency = dependency;
  static attributes = ['dimensions', 'numberOfFrames', 'streamUrl', 'apiaryRef'];
  

  constructor(hiveJSON) {
    Hive.jsonToObject(this, hiveJSON);
    this.references = {
      sub: ['threatModel', 'keeperAssignmentModel', 'hiveUpgradeModel'],
      parent:{
        "apiaryModel": this.apiaryRef,
      }
    }
  }

  static async get(id) {
    const result = await Hive.crudInterface.get(id, "hiveModel", "_id");
    if (result.success.status) {
      result.data = new Hive(result.data);
    }
    return result;
  }

  static async getAll() {
    const result = await Hive.crudInterface.getAll("hiveModel");
    if (result.success.status) {
      result.data = result.data.map(hive => new Hive(hive));
    }
    return result;
  }
  static async remove(id) {
    return await Hive.crudInterface.remove(id, "hiveModel", "_id");
  }

  static async modify(newHive) {
    const result = await Hive.crudInterface.modify(newHive._id, newHive, "hiveModel", "_id");
    if (result.success.status) {
      result.data = Hive.jsonToObject(newHive, result.data);
    }
    return result;
  }
  async create() {
    const valid = await Hive.dependency.validate(this.references.parent,this);
    if (!valid.success.status) return valid;
    const result = await Hive.crudInterface.create(this, "hiveModel", "_id");
    if (result.success.status) {
      result.data = Hive.jsonToObject(this, result.data);
    }
    return result;
  }

  async modify(newHive) {
    const result = await Hive.crudInterface.modify(this._id, newHive, "hiveModel", "_id");
    if (result.success.status) {
      result.data = Hive.jsonToObject(this, result.data);
    }
    return result;
  }

  async remove() {
    return await Hive.crudInterface.remove(this._id, "hiveModel", "_id");
  }
}

module.exports = Hive;
