class Reading {
    constructor(readingJSON) {
        this.sensorRef = readingJSON.sensorRef;
        this.sensorValue = readingJSON.sensorValue;
        this.hiveRef = readingJSON.hiveRef;
        this.frameNum = readingJSON.frameNum || null;
    }
}