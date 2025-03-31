const express = require("express");
const router = express.Router();

const controllers = {
  user: require("../Controllers/ctrlUser"),
  pages: require("../Controllers/ctrlPages"),
  apiary: require("../Controllers/ctrlApiary"),
  product: require("../Controllers/ctrlProduct"),
  upgrade: require("../Controllers/ctrlUpgrade"),
  hive: require("../Controllers/ctrlHive"),
  question: require("../Controllers/ctrlQuestion"),
  sensor: require("../Controllers/ctrlSensor"),
  hiveUpgrade: require("../Controllers/ctrlUpgrade"),
  threat: require("../Controllers/ctrlThreat"),
};

router.get("/dashboard", controllers.pages._ADMIN.adminDashboard);

router.post("/addHive", controllers.hive.addHive);
router.post("/removeHive", controllers.hive.removeHive);

router.delete("/hive", controllers.hive.removeHive);
router.delete("/apiary", controllers.apiary.removeApiary);
router.delete("/user", controllers.user.removeUser);
router.delete("/sensor", controllers.sensor.removeSensor);
router.delete("/product", controllers.product.removeProduct);
router.delete("/upgrade", controllers.hiveUpgrade.removeUpgrade);
router.delete("/question", controllers.question.removeQuestion);
router.delete("/threat", controllers.threat.removeThreat);


router.post("/addUser", controllers.user.addUser);
router.post("/addSensor", controllers.sensor.addSensor);
router.post("/addProduct", controllers.product.addProduct);

router.post("/updateUser", controllers.user.updateUser);

router.get("/getAllUsers", controllers.user.getUsers);
router.get("/getAllProducts", controllers.product.getProducts);
router.get("/getAllSensors", controllers.sensor.getSensors);
router.get("/getAllHives", controllers.hive.getHives);
router.get("/getAllApiaries", controllers.apiary.getApiaries);
router.get("/getAllHiveUpgrades", controllers.hiveUpgrade.getUpgrades);
router.get("/getAllQuestions", controllers.question.getQuestions);
router.get("/getAllThreats", controllers.threat.getThreats);

router.post("/makeOperational", controllers.hiveUpgrade.makeOperational);

router.get("/test-stream", (req, res) => {
  res.render("test-stream", { layout: false });
});

module.exports = router;
