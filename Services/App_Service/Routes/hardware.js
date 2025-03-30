const express = require("express");
const router = express.Router();

const controllers = {
    apiary: require("../Controllers/ctrlApiary"),
    hive: require("../Controllers/ctrlHive"),
    sensor: require("../Controllers/ctrlSensor"),
    threat: require("../Controllers/ctrlThreat"),
  };

router.post("/addSensorReading", controllers.sensor.addSensorReading);
router.post("/localForecast", controllers.apiary.updateForecast)
router.post("/addThreat", controllers.threat.addThreat)

module.exports = router;
