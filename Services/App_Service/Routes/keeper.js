const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ctrlPages = require("../Controllers/ctrlPages");
const ctrlUser = require("../Controllers/ctrlUser");

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


router.get("*", (req, res) => {
  res.redirect("/keeper");
});
module.exports = router;
