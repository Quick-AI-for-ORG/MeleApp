const express = require("express");
const router = express.Router();
const ctrlPages = require("../Controllers/ctrlPages");
const ctrlUser = require("../Controllers/ctrlUser");
const ctrlProduct = require("../Controllers/ctrlProduct");
const ctrlUpgrade = require("../Controllers/ctrlUpgrade");

const { sendUpgradeConfirmation } = require("../../Utils/mailer");
const weatherService = require("../../Utils/weatherService");
const localStreamService = require("../../Streaming/localStreamService");


router.post("/register", ctrlUser.register);
router.post("/login", ctrlUser.login);

router.use( (req, res, next) => {
  if(!req.session.user) res.redirect("/noLogin");
  else next();
})
router.get("/", (req, res) => {
  res.redirect("/keeper/dashboard");
});

router.get("/dashboard", ctrlPages._KEEPER.dashboard);
router.get("/profile", ctrlPages._KEEPER.profile);

router.get("/logout", ctrlUser.logout);
router.get("/upgrade", ctrlPages._KEEPER.upgrade);

router.post("/profile/update", ctrlUser.updateUser);
router.post("/upgrade", ctrlUpgrade.upgrade);

router.get("/getProducts", ctrlProduct.getProducts);

router.get("/test-stream", (req, res) => {
  res.render("test-stream", { user: req.session.user || null , layout: false });
});

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

router.get("*", (req, res) => {
  res.redirect("/keeper");
});

module.exports = router;
