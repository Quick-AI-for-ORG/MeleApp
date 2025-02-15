const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");
const dependency = require("../Utils/Dependency");

class Product {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static dependency = dependency;
  static attributes = ['name', 'price', 'description', 'subscription', 'images', 'counter'];

  constructor(productJSON) {
    Product.jsonToObject(this, productJSON);
    this.references = {
      sub: ['hiveUpgradeModel'],
    }
  }

  static async get(name) {
    const result = await Product.crudInterface.get(name, "productModel", "name");
    if (result.success.status) result.data = new Product(result.data);
    return result;
  }

  static async getAll() {
    const result = await Product.crudInterface.getAll("productModel");
    if (result.success.status) result.data = result.data.map(product => new Product(product));
    return result;
  }
  static async remove(id) {
    const product = new Product({ _id: id });
    const cascade = await Product.dependency.cascade(product.references.sub, product, 'productRef');
    if (!cascade.success.status) return cascade;
    return await Hive.crudInterface.remove(id, "productModel", "_id");
  }

  static async modify(newProduct) {
    const result = await Product.crudInterface.modify(newProduct.name, newProduct, "productModel", "name");
    if (result.success.status) {
      result.data = Product.jsonToObject(newProduct, result.data);
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
    const cascade = await Product.dependency.cascade(this.references.sub, this, 'productRef');
    if (!cascade.success.status) return cascade;
    return await Product.crudInterface.remove(this.name, "productModel", "name");
  }
}

module.exports = Product;
