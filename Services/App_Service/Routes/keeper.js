const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ctrlPages = require("../Controllers/ctrlPages");


router.get("/", (req, res) => {
  req.session.message = "Please login to access this page";
  res.redirect("/keeper/login");
});
router.get("/signup", ctrlPages._KEEPER.signup);

router.get("/login", ctrlPages._KEEPER.login);

router.get("/dashboard", (req, res) => {
  res.render("beekeeper", {
    layout: false,
    message: req.body.message === undefined ? null : req.body.message,
  });
});

router.get("/upgrade", async (req, res) => {
  try {
    const meleDB = mongoose.connection.useDb("meleDB");

    const collections = await meleDB.db.listCollections().toArray();

    const kits = await meleDB.db.collection("products").find({}).toArray();

    res.render("upgrade", {
      user: req.session.user || "",
      layout: false,
      kits: kits,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
    });
  } catch (error) {
    console.error("Database Error:", error);
    res.render("upgrade", {
      user: req.session.user || "",
      layout: false,
      kits: [],
    });
  }
});

router.post("/upgrade", (req, res) => {
  const upgradeData = req.body;
  res.redirect("/keeper/dashboard");
});

module.exports = router;
