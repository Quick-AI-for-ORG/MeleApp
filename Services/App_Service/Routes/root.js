const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("mele", {
    user: req.session.user === undefined ? "" : req.session.user,
  });
});
router.get("/aboutus", (req, res) => {
  res.render("aboutUs", { layout: false });
});


module.exports = router;
