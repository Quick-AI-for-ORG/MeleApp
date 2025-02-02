const express = require("express");
const router = express.Router();

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

router.get("/upgrade", (req, res) => {
  res.render("upgrade", {
    user: req.session.user || "",
    layout: false
  });
});

router.post("/upgrade", (req, res) => {
  const upgradeData = req.body;
  // Handle the upgrade data here
  res.redirect("/keeper/dashboard"); // Update redirect path
});

module.exports = router;
