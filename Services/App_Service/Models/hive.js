const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");
const dependency = require("../Utils/Dependency");

const Product = require("./Product");
class Hive {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static dependency = dependency;
  static attributes = ['dimensions', 'numberOfFrames', 'streamUrl', 'apiaryRef'];
  

  constructor(hiveJSON) {
    Hive.jsonToObject(this, hiveJSON);
    this.references = {
      sub: ['threatModel', 'keeperAssignmentModel', 'hiveUpgradeModel', 'readingModel'],
      parent:{
        "apiaryModel": this.apiaryRef,
      }
    }
    this.products = []
    this.threats = []
    this.readings = []
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
    const hive = new Hive({ _id: id });
    const cascade = await Hive.dependency.cascade(hive.references.sub, hive, 'hiveRef');
    if (!cascade.success.status) return cascade;
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
    const cascade = await Hive.dependency.cascade(this.references.sub, this, 'hiveRef');
    if (!cascade.success.status) return cascade;
    return await Hive.crudInterface.remove(this._id, "hiveModel", "_id");
  }

  async getUpgrades(){
    const result = await Hive.dependency.populate('hiveUpgradeModel', this, 'hiveRef')
    if(result.success.status) this.products = result.data;
    return result;
  }

  async getReadings(){
    const result = await Hive.dependency.populate('readingModel', this, 'hiveRef')
    if(result.success.status) this.readings = result.data;
    return result;
  }

  async getThreats(){
    const result = await Hive.dependency.populate('threatModel', this, 'hiveRef')
    if(result.success.status) this.threats = result.data;
    return result;
  }
}

module.exports = Hive;
