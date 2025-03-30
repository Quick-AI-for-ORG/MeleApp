const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");
const dependency = require("../Utils/Dependency");

class Question {
  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static dependency = dependency;
  static attributes = ["email", "message", "answer", "status", "userRef"];

  constructor(questionJSON) {
    Question.jsonToObject(this, questionJSON);
    this.references = {
      parent: {
        userModel: this.userRef,
      },
    };
  }

  static async get(id) {
    const result = await Question.crudInterface.get(id, "questionModel", "_id");
    if (result.success.status) {
      result.data = new Question(result.data);
    }
    return result;
  }

  static async getAll(sortBy = null, limit = null) {
    let result = null;
    if (sortBy || limit) result = await Question.crudInterface.getAllSorted("questionModel", sortBy, limit);
    else result = await Question.crudInterface.getAll("questionModel");
    if (result.success.status) {
      result.data = result.data.map((question) => new Question(question));
    }
    return result;
  }

  static async remove(id) {
    return await Question.crudInterface.remove(id, "questionModel", "_id");
  }

  static async count() {
    const result = await Question.crudInterface.getCount("questionModel");
    return result;
  }

  async create() {
    if (this.userRef) {
      const valid = await Question.dependency.validate(this.references.parent, this);
      if (!valid.success.status) return valid;
    }
    const result = await Question.crudInterface.create(this, "questionModel", "_id");
    if (result.success.status) {
      result.data = Question.jsonToObject(this, result.data);
    }
    return result;
  }

  async modify(newQuestion) {
    const result = await Question.crudInterface.modify(this._id, newQuestion, "questionModel", "_id");
    if (result.success.status) {
      result.data = Question.jsonToObject(this, result.data);
    }
    return result;
  }

  async remove() {
    return await Question.crudInterface.remove( this._id, "questionModel", "_id");
  }

  async reply(answer) {
    this.answer = answer;
    this.status = "replied";
    return await this.modify(this);
  }
}

module.exports = Question;
