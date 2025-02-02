const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");

class Hive {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static attributes = ['dimensions', 'numberOfFrames', 'streamUrl', 'apiaryRef'];

  constructor(hiveJSON) {
    Hive.jsonToObject(this, hiveJSON);
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

  async create() {
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
