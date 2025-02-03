const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");

class HiveUpgrade {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static attributes = ['hiveRef', 'upgradeRef', 'userRef'];

  constructor(upgradeJSON) {
    HiveUpgrade.jsonToObject(this, upgradeJSON);
  }

  static async get(id) {
    const result = await HiveUpgrade.crudInterface.get(id, "hiveUpgradeModel", "_id");
    if (result.success.status) {
      result.data = new HiveUpgrade(result.data);
    }
    return result;
  }

  static async getAll() {
    const result = await HiveUpgrade.crudInterface.getAll("hiveUpgradeModel");
    if (result.success.status) {
      result.data = result.data.map(upgrade => new HiveUpgrade(upgrade));
    }
    return result;
  }

  async create() {
    const result = await HiveUpgrade.crudInterface.create(this, "hiveUpgradeModel", "_id");
    if (result.success.status) {
      result.data = HiveUpgrade.jsonToObject(this, result.data);
    }
    return result;
  }

  async modify(newUpgrade) {
    const result = await HiveUpgrade.crudInterface.modify(this._id, newUpgrade, "hiveUpgradeModel", "_id");
    if (result.success.status) {
      result.data = HiveUpgrade.jsonToObject(this, result.data);
    }
    return result;
  }

  async remove() {
    return await HiveUpgrade.crudInterface.remove(this._id, "hiveUpgradeModel", "_id");
  }
}

module.exports = HiveUpgrade;
