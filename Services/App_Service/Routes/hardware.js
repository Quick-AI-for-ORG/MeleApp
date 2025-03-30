const express = require("express");
const router = express.Router();

const controllers = {
    apiary: require("../Controllers/ctrlApiary"),
    hive: require("../Controllers/ctrlHive"),
    sensor: require("../Controllers/ctrlSensor"),
    threat: require("../Controllers/ctrlThreat"),
    capture: require("../Controllers/ctrlCapture"),
  };

router.post("/addSensorReading", controllers.sensor.addSensorReading);
router.post("/localForecast", controllers.apiary.updateForecast)
router.post("/addThreat", controllers.threat.addThreat)
router.post("/addCapture", controllers.capture.addCapture)
module.exports = router;
