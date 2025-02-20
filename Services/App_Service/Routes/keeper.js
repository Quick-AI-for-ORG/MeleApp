const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ctrlPages = require("../Controllers/ctrlPages");
const ctrlUser = require("../Controllers/ctrlUser");
const ctrlProduct = require("../Controllers/ctrlProduct");

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
