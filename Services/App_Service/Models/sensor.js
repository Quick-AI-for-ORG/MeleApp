class Sensor {
    constructor(sensorJSON) {
        this.sensorType = sensorJSON.sensorType;
        this.status = sensorJSON.status;
        this.description = sensorJSON.description;
        this.imagePath = sensorJSON.imagePath;
        this.modelName = sensorJSON.modelName;
    }
}