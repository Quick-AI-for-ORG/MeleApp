const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");

class Upgrade {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static attributes = ['userRef', 'productRef'];

  constructor(upgradeJSON) {
    Upgrade.jsonToObject(this, upgradeJSON);
  }

  static async get(id) {
    const result = await Upgrade.crudInterface.get(id, "upgradeModel", "_id");
    if (result.success.status) {
      result.data = new Upgrade(result.data);
    }
    return result;
  }

  static async getAll() {
    const result = await Upgrade.crudInterface.getAll("upgradeModel");
    if (result.success.status) {
      result.data = result.data.map(upgrade => new Upgrade(upgrade));
    }
    return result;
  }

  async create() {
    const result = await Upgrade.crudInterface.create(this, "upgradeModel", "_id");
    if (result.success.status) {
      result.data = Upgrade.jsonToObject(this, result.data);
    }
    return result;
  }

  async modify(newUpgrade) {
    const result = await Upgrade.crudInterface.modify(this._id, newUpgrade, "upgradeModel", "_id");
    if (result.success.status) {
      result.data = Upgrade.jsonToObject(this, result.data);
    }
    return result;
  }

  async remove() {
    return await Upgrade.crudInterface.remove(this._id, "upgradeModel", "_id");
  }
}

module.exports = Upgrade;
