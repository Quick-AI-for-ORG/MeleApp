class Threat {
    constructor(threatJSON) {
        this.threatType = threatJSON.threatType;
        this.hiveRef = threatJSON.hiveRef;
        this.action = threatJSON.action;
    }
}
