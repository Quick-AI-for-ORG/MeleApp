const express = require("express");
const router = express.Router();

const controllers = {
    apiary: require("../Controllers/ctrlApiary"),
    hive: require("../Controllers/ctrlHive"),
    sensor: require("../Controllers/ctrlSensor"),
    threat: require("../Controllers/ctrlThreat"),
    capture: require("../Controllers/ctrlCapture"),
    reading: require("../Controllers/ctrlReading")
  };
  
  router.use((req, res, next) => {
      req.session.isHardware = true;
      next();
  });

router.post("/addReading", controllers.reading.addReading)
router.post("/addThreat", controllers.threat.addThreat)
router.post("/addCapture", controllers.capture.addCapture)

router.post("/getApiary", controllers.apiary.getApiary)
router.post("/getHive", controllers.hive.getHive)
router.post("/getSensor", controllers.sensor.getSensor)
router.post("/getHiveReadings", controllers.hive.getSortedReadings)

router.post("/localForecast", controllers.apiary.updateForecast)



module.exports = router;
