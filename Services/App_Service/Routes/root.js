const express = require("express");
const router = express.Router();
const ctrlPages = require("../Controllers/ctrlPages");

router.get("/", ctrlPages._PUBLIC.home);
router.get("/aboutus", ctrlPages._PUBLIC.about);

router.get("/products",ctrlPages._PUBLIC.products);

router.get("/products/:id",ctrlPages._PUBLIC.product);

module.exports = router;
