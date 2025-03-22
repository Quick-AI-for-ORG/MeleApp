const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");
const dependency = require("../Utils/Dependency");

class Apiary {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static dependency = dependency;
  static attributes = ['name', 'location', 'temperature', 'humidity', 'numberOfHives', 'owner'];

  constructor(apiaryJSON) {
    Apiary.jsonToObject(this, apiaryJSON);
    this.references = {
      sub: ['hiveModel', 'keeperAssignmentModel'],
      parent:{
        "userModel": this.owner,
      }
    }
    this.hives = []
    this.assignment = [];
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
  static async modify(newApiary) {
    const result = await Apiary.crudInterface.modify(newApiary._id, newApiary, "apiaryModel", "_id");
    if (result.success.status) {
      result.data = Apiary.jsonToObject(newApiary, result.data);
    }
    return result;
  }
  static async remove(id) {
    const apiary = new Apiary({ _id: id });
    const cascade = await Apiary.dependency.cascade(apiary.references.sub, this, 'apiaryRef');
    if (!cascade.success.status) return cascade;
    return await Apiary.crudInterface.remove(id, "apiaryModel", "_id");
  }

  async create() {
    const valid = await Apiary.dependency.validate(this.references.parent,this);
    if (!valid.success.status) return valid;
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
    const cascade = await Apiary.dependency.cascade(this.references.sub, this, 'apiaryRef');
    if (!cascade.success.status) return cascade;
    return await Apiary.crudInterface.remove(this._id, "apiaryModel", "_id");
  }

  async getHives(){
    const result = await Apiary.dependency.populate('hiveModel', this, 'apiaryRef');
    if(result.success.status) this.hives = result.data;
    return result;
  }
  async increment(numberOfHives){
    this.numberOfHives = parseInt(numberOfHives, 10) + parseInt(this.numberOfHives, 10);
    return await this.modify(this)
  }

  async getAssignemnt(){
    const result = await Apiary.dependency.populate('keeperAssignmentModel', this, 'apiaryRef');
    if(result.success.status) this.assignment = result.data;
    return result;
  }
}
module.exports = Apiary;
