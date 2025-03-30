const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");
const dependency = require("../Utils/Dependency");

class HiveUpgrade {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static dependency = dependency;
  static attributes = ['hiveRef', 'productRef', 'userRef', 'operational'];

  constructor(upgradeJSON) {
    HiveUpgrade.jsonToObject(this, upgradeJSON);
    this.references = {
      parent: {
        "hiveModel": this.hiveRef,
        "productModel": this.productRef,
        "userModel": this.userRef
      }
    }
  }

  static async get(id) {
    const result = await HiveUpgrade.crudInterface.get(id, "hiveUpgradeModel", "_id");
    if (result.success.status) {
      result.data = new HiveUpgrade(result.data);
    }
    return result;
  }

  static async get(hive, product){
    const result = await HiveUpgrade.crudInterface.getNested([hive, product], "hiveUpgradeModel", ["hiveRef", "productRef"]);
    if (result.success.status) {
      result.data = new HiveUpgrade(result.data);
    }
    return result;
  }

  static async getAll(sortBy = null, limit = null) {
    let result = null;
    if (sortBy || limit) result = await HiveUpgrade.crudInterface.getAllSorted("hiveUpgradeModel", sortBy, limit);
    else result = await HiveUpgrade.crudInterface.getAll("hiveUpgradeModel");
    if (result.success.status) {
      result.data = result.data.map(upgrade => new HiveUpgrade(upgrade));
    }
    return result;
  }
  static async remove(id) {
    return await HiveUpgrade.crudInterface.remove(id, "hiveUpgradeModel", "_id");
  }

  static async count(){
    const result = await HiveUpgrade.crudInterface.getCount("hiveUpgradeModel");
    return result;
  }
  async create() {
    const valid = await HiveUpgrade.dependency.validate(this.references.parent, this);
    if (!valid.success.status) return valid;
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

  async makeOperational(){
    this.operational = true;
    return await this.modify(this);
  }
}

module.exports = HiveUpgrade;
