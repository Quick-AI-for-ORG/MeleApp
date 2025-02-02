const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");

class Apiary {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static attributes = ['name', 'location', 'temperature', 'humidity', 'numberOfHives', 'owner'];

  constructor(apiaryJSON) {
    Apiary.jsonToObject(this, apiaryJSON);
  }

  static async get(id) {
    const result = await Apiary.crudInterface.get(id, "apiaryModel", "_id");
    if (result.success.status) {
      result.data = new Apiary(result.data);
    }
    return result;
  }

  static async getAll() {
    const result = await Apiary.crudInterface.getAll("apiaryModel");
    if (result.success.status) {
      result.data = result.data.map(apiary => new Apiary(apiary));
    }
    return result;
  }

  async create() {
    const result = await Apiary.crudInterface.create(this, "apiaryModel", "_id");
    if (result.success.status) {
      result.data = Apiary.jsonToObject(this, result.data);
    }
    return result;
  }

  async modify(newApiary) {
    const result = await Apiary.crudInterface.modify(this._id, newApiary, "apiaryModel", "_id");
    if (result.success.status) {
      result.data = Apiary.jsonToObject(this, result.data);
    }
    return result;
  }

  async remove() {
    return await Apiary.crudInterface.remove(this._id, "apiaryModel", "_id");
  }
}

module.exports = Apiary;
