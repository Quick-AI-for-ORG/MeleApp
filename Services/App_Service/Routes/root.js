const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("mele", {
    user: req.session.user === undefined ? "" : req.session.user,
  });
});

router.get("/signup", (req, res) => {
  res.render("signup", { layout: false });
});

router.get("/login", (req, res) => {
  res.render("login", { layout: false });
});

module.exports = router;
