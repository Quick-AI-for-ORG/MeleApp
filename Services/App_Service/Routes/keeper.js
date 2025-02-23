const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ctrlPages = require("../Controllers/ctrlPages");
const ctrlUser = require("../Controllers/ctrlUser");
const ctrlProduct = require("../Controllers/ctrlProduct");

const { sendUpgradeConfirmation } = require("../../Utils/mailer");

router.get("/", (req, res) => {
  if (!req.session.user) ctrlPages._PUBLIC.noLogin(req, res);
  else res.redirect("/keeper/dashboard");
});

router.get("/signup", ctrlPages._KEEPER.signup);
router.get("/login", ctrlPages._KEEPER.login);
router.get("/dashboard", ctrlPages._KEEPER.dashboard);
router.get("/logout", ctrlUser.logout);
router.get("/upgrade", ctrlPages._KEEPER.upgrade);
router.get("/profile", ctrlPages._KEEPER.profile);

router.post("/register", ctrlUser.register);
router.post("/login", ctrlUser.login);
router.post("/profile/update", ctrlUser.updateUser);

router.post("/upgrade", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Please sign in first" });
  }

  try {
    const {
      apiaryName,
      hivesCount,
      latitude,
      longitude,
      kitSelection,
      framesCount,
      length,
      width,
      height,
    } = req.body;

    // Save the upgrade request to database (implement this based on your schema)
    // ...

    // Send confirmation email
    const emailSent = await sendUpgradeConfirmation(
      req.session.user.email,
      apiaryName,
      hivesCount
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

router.get("*", (req, res) => {
  res.redirect("/keeper");
});
module.exports = router;
