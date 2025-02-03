const express = require("express");
const router = express.Router();
const ctrlPages = require("../Controllers/ctrlPages");
const ctrlHive = require("../Controllers/ctrlHive");
router.get("/", ctrlPages._PUBLIC.home);
router.get("/aboutus", ctrlPages._PUBLIC.about);
router.get("/products",ctrlPages._PUBLIC.products);
router.get("/product",ctrlPages._PUBLIC.product);
router.post("/product",ctrlPages._PUBLIC.product);

module.exports = router;
