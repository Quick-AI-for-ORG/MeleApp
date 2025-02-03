const Result = require("../../Shared/Result")

const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");

const bcrypt = require("bcrypt");
const HASH_SALT = 12;

class User {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static attributes = ['name', 'role', 'email', 'password', 'tel', 'address', 'affiliation'];
  static cascading = ['apiaryModel',  ];

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
    if (result.success.status) result.data =  result.data.map(user => new User(user, user.role));
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
    if(result.success.status) result.data = User.jsonToObject(this, result.data)
    return result
  }
  async modify(newUser) {
    const result = await User.crudInterface.modify(this.email, newUser, "userModel", "email");
    if(result.success.status) result.data = User.jsonToObject(this, result.data);
    return result
  }
  async remove() {
    return await User.crudInterface.remove(this.email, "userModel", "email");
  }
  async getApiaries() {
    const result = await Apiary.getByUser(this._id);
    if(result.success.status) this.apiaries = result.data;
    return result;
  }

  async getHives(){
    for (let i = 0; i < this.apiaries.length; i++) {
      const apiary = this.apiaries[i];
      const result = await apiary.getHives();
      if(!result.success.status) return result;
      this.apiaries[i] = apiary;
    }
  }

}

module.exports = User;
