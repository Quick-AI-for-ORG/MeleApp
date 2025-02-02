class Apiary {
    constructor(apiaryJSON) {
        this.name = apiaryJSON.name;
        this.location = apiaryJSON.location;
        this.temperature = apiaryJSON.temperature || null;
        this.humidity = apiaryJSON.humidity || null;
        this.numberOfHives = apiaryJSON.numberOfHives;
        this.owner = apiaryJSON.owner;
    }
}