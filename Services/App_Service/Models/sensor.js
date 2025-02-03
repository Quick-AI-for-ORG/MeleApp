const crudInterface = require("../Utils/CRUD");
const jsonToObject = require("../Utils/Mapper");

class Sensor {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static attributes = ['sensorType', 'status', 'description', 'imagePath', 'modelName'];

  constructor(sensorJSON) {
    Sensor.jsonToObject(this, sensorJSON);
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
    return await Sensor.crudInterface.remove(sensorType, "sensorModel", "sensorType");
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
    return await Sensor.crudInterface.remove(this.sensorType, "sensorModel", "sensorType");
  }
}

module.exports = Sensor;
