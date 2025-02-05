const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");
const dependency = require("../Utils/Dependency");

class Sensor {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static dependency = dependency;
  static attributes = ['sensorType', 'status', 'description', 'imagePath', 'modelName'];

  constructor(sensorJSON) {
    Sensor.jsonToObject(this, sensorJSON);
     this.references = {
      sub: ['readingModel'],
    }
  }

  static async get(sensorType) {
    const result = await Sensor.crudInterface.get(sensorType, "sensorModel", "sensorType");
    if (result.success.status) {
      result.data = new Sensor(result.data);
    }
    return result;
  }

  static async getAll() {
    const result = await Sensor.crudInterface.getAll("sensorModel");
    if (result.success.status) {
      result.data = result.data.map(sensor => new Sensor(sensor));
    }
    return result;
  }

  static async remove(sensorType) {
    const sensor = await Sensor.get(sensorType);
    const cascade = await Sensor.dependency.cascade(sensor.references.sub, sensor, 'sensorRef');
    if (!cascade.success.status) return cascade;
    return await Sensor.crudInterface.remove(sensorType, "sensorModel", "sensorType");
  }

  static async modify(newSensor) {
    const result = await Sensor.crudInterface.modify(newSensor.sensorType, newSensor, "sensorModel", "sensorType");
    if (result.success.status) {
      result.data = Sensor.jsonToObject(newSensor, result.data);
    }
    return result;
  }

  async create() {
    const result = await Sensor.crudInterface.create(this, "sensorModel", "sensorType");
    if (result.success.status) {
      result.data = Sensor.jsonToObject(this, result.data);
    }
    return result;
  }

  async modify(newSensor) {
    const result = await Sensor.crudInterface.modify(this.sensorType, newSensor, "sensorModel", "sensorType");
    if (result.success.status) {
      result.data = Sensor.jsonToObject(this, result.data);
    }
    return result;
  }

  async remove() {
    const cascade = await Sensor.dependency.cascade(this.references.sub, this, 'sensorRef');
    if (!cascade.success.status) return cascade;
    return await Sensor.crudInterface.remove(this.sensorType, "sensorModel", "sensorType");
  }
}

module.exports = Sensor;
