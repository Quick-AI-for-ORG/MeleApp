class Hive {
    constructor(hiveJSON) {
        this.dimensions = hiveJSON.dimensions;
        this.numberOfFrames = hiveJSON.numberOfFrames;
        this.streamUrl = hiveJSON.streamUrl || null;
        this.apiaryRef = hiveJSON.apiaryRef || null;
    }
}