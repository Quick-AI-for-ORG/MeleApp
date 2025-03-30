const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");
const dependency = require("../Utils/Dependency");

class Product {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static dependency = dependency;
  static attributes = ['name', 'price', 'description', 'subscription', 'images', 'counter', 'sensors'];

  constructor(productJSON) {
    Product.jsonToObject(this, productJSON);
    this.references = {
      parent: {
        "sensorModel": this.sensors
      },
      sub: ['hiveUpgradeModel'],
    }
  }

  static async get(key, by="name") {
    const result = await Product.crudInterface.get(key, "productModel", by);
    if (result.success.status) result.data = new Product(result.data);
    return result;
  }

  static async getAll(sortBy = null, limit = null) {
    let result = null;
    if (sortBy || limit) result = await Product.crudInterface.getAllSorted("productModel", sortBy, limit);
    else result = await Product.crudInterface.getAll("productModel");
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

  static async count() {
    const result = await Product.crudInterface.getCount("productModel");
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

  async addSensors(sensors) {
    this.sensors = sensors;
    return await this.modify(this);
  }

  async increment(){
    this.counter += 1;
    return await this.modify(this);
  }

  async decrement(){
    this.counter -= 1;
    return await this.modify(this);
  }
}

module.exports = Product;
