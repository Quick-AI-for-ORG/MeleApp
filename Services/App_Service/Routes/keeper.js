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
};

const localStreamService = require("../../Streaming/localStreamService");

router.post("/register", controllers.user.register);
router.post("/login", controllers.user.login);

router.use((req, res, next) => {
  if (!req.session.user) res.redirect("/noLogin");
  else next();
});


router.get("/", (req, res) => {
  res.redirect("/keeper/dashboard");
});

router.get("/dashboard", controllers.pages._KEEPER.dashboard);
router.get("/profile", controllers.pages._KEEPER.profile);

router.get("/logout", controllers.user.logout);
router.get("/upgrade", controllers.pages._KEEPER.upgrade);

router.post("/profile/update", controllers.user.updateUser);
router.post("/upgrade", controllers.upgrade.upgrade);

router.get("/getProducts", controllers.product.getProducts);

router.get("/test-stream", (req, res) => {
  res.render("test-stream", { user: req.session.user || null, layout: false });
});


router.post("/getApiaryHives", controllers.apiary.getApiaryHives)
router.post("/getApiaryKeepers", controllers.keeper.getApiaryKeepers)
router.post("/getHive", controllers.hive.getHive)


router.post("/start-stream", async (req, res) => {
  const { hiveId } = req.body;
  const result = await localStreamService.startStream(hiveId);
  res.json(result);
});

router.post("/handle-answer", async (req, res) => {
  const { hiveId, answer } = req.body;
  const result = await localStreamService.handleAnswer(hiveId, answer);
  res.json(result);
});

router.post("/add-ice-candidate", async (req, res) => {
  const { hiveId, candidate } = req.body;
  const result = await localStreamService.addIceCandidate(hiveId, candidate);
  res.json(result);
});

router.use((req, res, next) => {
  if (req.session.user.role != "Owner") res.json({ success: {status: false}, message: "Unauthorized - Must be Apiary Owner to Continue" });
  else next();
});

router.post("/assignKeeper", controllers.keeper.assignKeeper)
router.delete("/removeKeeper", controllers.user.removeUser)


router.get("*", (req, res) => {
  res.redirect("/keeper");
});

module.exports = router;