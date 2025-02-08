const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ctrlPages = require("../Controllers/ctrlPages");
const ctrlUser = require("../Controllers/ctrlUser");

router.get("/", (req, res) => {
  if (!req.session.user) {
    if(!req.session.message) req.session.message = "Please Login to view this page.";
    res.redirect("/keeper/login");
  } else res.render("beekeeper", { layout: false, user: req.session.user });
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
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
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

router.post("/register", ctrlUser.register);
router.post("/login", ctrlUser.login);
router.get("/logout", ctrlUser.logout);

router.get("/profile", async (req, res) => {
  if (!req.session.user) {
    req.session.message = "Please login to access your profile";
    return res.redirect("/keeper/login");
  }

  try {
    const meleDB = mongoose.connection.useDb("meleDB");
    const userData = await meleDB
      .collection("users")
      .findOne({ _id: new mongoose.Types.ObjectId(req.session.user._id) });

    if (!userData) {
      req.session.message = "User not found";
      return res.redirect("/keeper/login");
    }

    const message = req.session.message;
    req.session.message = null;

    res.render("profile", {
      layout: false,
      user: userData,
      message: message,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    req.session.message = "Error loading profile";
    res.redirect("/keeper/login");
  }
});

router.post("/profile/update", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const userId = req.session.user._id;
    const meleDB = mongoose.connection.useDb("meleDB");

    // Combine firstName and lastName into name
    const name = `${firstName} ${lastName}`.trim();

    const updateData = {
      name,
      email,
      updatedAt: new Date(),
    };

    if (password && password.trim() !== "") {
      updateData.password = password;
    }

    await meleDB
      .collection("users")
      .updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { $set: updateData }
      );

    // Update session data
    req.session.user = {
      ...req.session.user,
      name,
      firstName,
      lastName,
      email,
    };

    req.session.message = "Profile updated successfully";
    res.redirect("/keeper/profile");
  } catch (error) {
    console.error("Profile update error:", error);
    req.session.message = "Error updating profile";
    res.redirect("/keeper/profile");
  }
});

router.get("/login", ctrlPages._KEEPER.login);
router.get("/signup", ctrlPages._KEEPER.signup);
router.get("/dashboard", ctrlPages._KEEPER.dashboard);

router.get("*", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/keeper/login");
  }
  res.redirect("/keeper");
});

module.exports = router;
