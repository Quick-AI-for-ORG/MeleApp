const express = require("express");
const router = express.Router();
const ctrlPages = require("../Controllers/ctrlPages");
const ctrlUser = require("../Controllers/ctrlUser");
const ctrlProduct = require("../Controllers/ctrlProduct");

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

router.post("/upgrade", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Please sign in first" });
  }

  try {
    const { apiaryName, latitude, longitude } = req.body;

    // Log weather data
    const weatherData = await weatherService.logWeatherData(
      apiaryName,
      latitude,
      longitude
    );

    // Add weather data to the email
    const formDataWithWeather = {
      ...req.body,
      weather: weatherData,
    };

    // Send confirmation email with weather data
    const emailSent = await sendUpgradeConfirmation(
      req.session.user.email,
      formDataWithWeather
    );

    if (!emailSent) {
      console.warn("Failed to send confirmation email");
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Upgrade error:", error);
    res.status(500).json({ error: "Failed to process upgrade request" });
  }
});

router.get("/getProducts", async (req, res) => {
  try {
    const result = await ctrlProduct.getProducts(req, res);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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
