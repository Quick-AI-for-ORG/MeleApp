const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/", (req, res) => {
  req.session.message = "Please login to access this page";
  res.redirect("/keeper/login");
});
router.get("/signup", (req, res) => {
  let message = req.session.message === undefined ? null : req.session.message;
  req.session.message = undefined;
  res.render("signup", { layout: false, message: message });
});

router.get("/login", (req, res) => {
  let message = req.session.message === undefined ? null : req.session.message;
  req.session.message = undefined;
  res.render("login", { layout: false, message: message });
});

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

router.get("/profile", (req, res) => {
    if (!req.session.user) {
        req.session.message = "Please login to access your profile";
        return res.redirect("/keeper/login");
    }
    res.render("profile", {
        layout: true,
        user: req.session.user
    });
});

router.post("/profile/update", async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const userId = req.session.user._id;
        const meleDB = mongoose.connection.useDb("meleDB");

        const updateData = {
            firstName,
            lastName,
            email,
            updatedAt: new Date()
        };

        // Only include password in update if it was provided
        if (password && password.trim() !== '') {
            updateData.password = password;
        }

        await meleDB.collection("users").updateOne(
            { _id: new mongoose.Types.ObjectId(userId) },
            { $set: updateData }
        );

        // Update session data
        req.session.user = {
            ...req.session.user,
            firstName,
            lastName,
            email
        };

        res.redirect("/keeper/profile");
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).send("Error updating profile");
    }
});

module.exports = router;
