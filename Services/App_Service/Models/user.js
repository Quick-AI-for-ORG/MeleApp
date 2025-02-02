const Result = require("../../Shared/Result")

const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");

const bcrypt = require("bcrypt");
const HASH_SALT = 12;

class User {
  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;

  constructor(userJSON, role = "Owner") {
    User.jsonToObject(this, userJSON, { role: role });
  }
  static async hashPassword(password) {
    return await bcrypt.hash(password, HASH_SALT);
  }
  static async remove(email) {
    return await User.crudInterface.remove(email, "userModel", "email");
  }
  static async get(email) {
    const result = await User.crudInterface.get(email, "userModel", "email");
    if (result.success.status) result.data =  new User(result.data, result.data.role);
    return result
  }
  static async getAll() {
    const result = await User.crudInterface.getAll("userModel");
    if (result.success.status) {
      let users = [];
      if (result.data.length > 0) {
        for (let i = 0; i < result.data.length; i++) {
          users.push(new User(result.data[i], result.data[i].role));
        }
        result.data = users
        };
      } 
    return result
  }
  static async login(email, password) {
    const result = await User.get(email);
    if (!result.success.status) return result;
    if (password != null) {
      const isPasswordValid = await bcrypt.compare(password, result.data.password);
      if (!isPasswordValid) {
        return new Result(0, null, "Incorrect Email or Password.");
      }
    }
    return new Result(1, new User(result.data, result.data.role), "User Logged In Successfully.");
  }

  async create() {
    this.password = await User.hashPassword(this.password);
    const result = await User.crudInterface.create(this, "userModel", "email");
    if(result.success.status) result.data = this
    return result
  }
  async modify(newUser) {
    const result = await User.crudInterface.modify(this.email, newUser, "userModel", "email");
    if(result.success.status){
      User.jsonToObject(this, result.data);
      result.data = this
    }
    return result
  }
  async remove() {
    return await User.crudInterface.remove(this.email, "userModel", "email");
  }
}

module.exports = User;
