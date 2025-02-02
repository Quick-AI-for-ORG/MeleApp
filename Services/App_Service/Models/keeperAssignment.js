const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");

class KeeperAssignment {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static attributes = ['beekeeperRef', 'hiveRef', 'apiaryRef'];

  constructor(assignmentJSON) {
    KeeperAssignment.jsonToObject(this, assignmentJSON);
  }

  static async get(id) {
    const result = await KeeperAssignment.crudInterface.get(id, "keeperAssignmentModel", "_id");
    if (result.success.status) {
      result.data = new KeeperAssignment(result.data);
    }
    return result;
  }

  static async getAll() {
    const result = await KeeperAssignment.crudInterface.getAll("keeperAssignmentModel");
    if (result.success.status) {
      result.data = result.data.map(assignment => new KeeperAssignment(assignment));
    }
    return result;
  }

  async create() {
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
