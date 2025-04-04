const express = require("express");
const router = express.Router();

const controllers = {
  user: require("../Controllers/ctrlUser"),
  pages: require("../Controllers/ctrlPages"),
  apiary: require("../Controllers/ctrlApiary"),
  product: require("../Controllers/ctrlProduct"),
  upgrade: require("../Controllers/ctrlUpgrade"),
  keeper: require("../Controllers/ctrlKeeper"),
  hive: require("../Controllers/ctrlHive"),
  question: require("../Controllers/ctrlQuestion"),
  capture: require("../Controllers/ctrlCapture")
};


router.post("/register", controllers.user.register);
router.post("/login", controllers.user.login);
router.post("/localForecast", controllers.apiary.updateForecast);
router.post("/askQuestion", controllers.question.addQuestion);

router.use((req, res, next) => {
  if (!req.session.user) res.redirect("/noLogin");
  else next();
});

router.get("/", (req, res) => {
  res.redirect("/keeper/dashboard");
});

router.get("/dashboard", controllers.pages._KEEPER.dashboard);
router.get("/capture", controllers.pages._KEEPER.yield);

router.get("/profile", controllers.pages._KEEPER.profile);

router.get("/logout", controllers.user.logout);
router.get("/upgrade", controllers.pages._KEEPER.upgrade);

router.post("/profile/update", controllers.user.updateUser);
router.post("/upgrade", controllers.upgrade.upgrade);

router.get("/getProducts", controllers.product.getProducts);

router.get("/stream", controllers.hive.openDoorStream);
router.post("/inspectYield", controllers.capture.getHoneyInspection)


router.post("/getApiaryHives", controllers.apiary.getApiaryHives);
router.post("/getApiaryKeepers", controllers.keeper.getApiaryKeepers);
router.post("/getHive", controllers.upgrade.getUpgradedHive);
router.post("/getHiveReadings", controllers.hive.getReadings);




router.use((req, res, next) => {
  if (req.session.user.role != "Owner")
    res.json({
      success: { status: false },
      message: "Unauthorized - Must be Apiary Owner to Continue",
    });
  else next();
});

router.post("/assignKeeper", controllers.keeper.assignKeeper);
router.post("/addHiveUpgrade", controllers.upgrade.addUpgrade);
router.post("/removeUpgrade", controllers.upgrade.removeUpgrade);
router.delete("/removeKeeper", controllers.user.removeUser);

router.get("*", (req, res) => {
  res.redirect("/keeper");
});

module.exports = router;
