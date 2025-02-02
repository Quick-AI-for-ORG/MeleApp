const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");

class Product {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static attributes = ['name', 'price', 'description', 'subscription'];

  constructor(productJSON) {
    Product.jsonToObject(this, productJSON);
  }

  static async get(name) {
    const result = await Product.crudInterface.get(name, "productModel", "name");
    if (result.success.status) {
      result.data = new Product(result.data);
    }
    return result;
  }

  static async getAll() {
    const result = await Product.crudInterface.getAll("productModel");
    if (result.success.status) {
      result.data = result.data.map(product => new Product(product));
    }
    return result;
  }

  async create() {
    const result = await Product.crudInterface.create(this, "productModel", "name");
    if (result.success.status) {
      result.data = Product.jsonToObject(this, result.data);
    }
    return result;
  }

  async modify(newProduct) {
    const result = await Product.crudInterface.modify(this.name, newProduct, "productModel", "name");
    if (result.success.status) {
      result.data = Product.jsonToObject(this, result.data);
    }
    return result;
  }

  async remove() {
    return await Product.crudInterface.remove(this.name, "productModel", "name");
  }
}

module.exports = Product;
