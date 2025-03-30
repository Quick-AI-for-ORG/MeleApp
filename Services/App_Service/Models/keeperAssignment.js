const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");
const dependency = require("../Utils/Dependency");

class KeeperAssignment {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static dependency = dependency;
  static attributes = ['beekeeperRef', 'apiaryRef'];

  constructor(assignmentJSON) {
    KeeperAssignment.jsonToObject(this, assignmentJSON);
    this.references = {
      parent: {
        "userModel": this.beekeeperRef,
        "apiaryModel": this.apiaryRef
      }
    }
  }

  static async get(id) {
    const result = await KeeperAssignment.crudInterface.get(id, "keeperAssignmentModel", "_id");
    if (result.success.status) {
      result.data = new KeeperAssignment(result.data);
    }
    return result;
  }

  static async getAll(sortBy = null, limit = null) {
    let result = null;
    if (sortBy || limit) result = await KeeperAssignment.crudInterface.getAllSorted("keeperAssignmentModel", sortBy, limit);
    else result = await KeeperAssignment.crudInterface.getAll("keeperAssignmentModel");
    if (result.success.status) {
      result.data = result.data.map(assignment => new KeeperAssignment(assignment));
    }
    return result;
  }

  static async remove(id) {
    return await KeeperAssignment.crudInterface.remove(id, "keeperAssignmentModel", "_id");
  }

  static async count(){
    const result = await KeeperAssignment.crudInterface.getCount("keeperAssignmentModel");
    return result;
  }
  async create() {
    const valid = await KeeperAssignment.dependency.validate(this.references.parent, this);
    if (!valid.success.status) return valid;
    const result = await KeeperAssignment.crudInterface.create(this, "keeperAssignmentModel", "_id");
    if (result.success.status) {
      result.data = KeeperAssignment.jsonToObject(this, result.data);
    }
    return result;
  }

  async modify(newAssignment) {
    const result = await KeeperAssignment.crudInterface.modify(this._id, newAssignment, "keeperAssignmentModel", "_id");
    if (result.success.status) {
      result.data = KeeperAssignment.jsonToObject(this, result.data);
    }
    return result;
  }

  async remove() {
    return await KeeperAssignment.crudInterface.remove(this._id, "keeperAssignmentModel", "_id");
  }
}

module.exports = KeeperAssignment;
