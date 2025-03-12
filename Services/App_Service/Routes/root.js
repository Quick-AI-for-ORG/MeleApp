const express = require("express");
const router = express.Router();
const ctrlPages = require("../Controllers/ctrlPages");

router.get("/notFound", ctrlPages._PUBLIC.notFound);
router.get("/", ctrlPages._PUBLIC.home);
router.get("/aboutus", ctrlPages._PUBLIC.about);
router.get("/products",ctrlPages._PUBLIC.products);
router.get("/product",ctrlPages._PUBLIC.product);
router.post("/product",ctrlPages._PUBLIC.product);

router.get("/signup", ctrlPages._KEEPER.signup);
router.get("/login", ctrlPages._KEEPER.login);
router.get("/noLogin", ctrlPages._PUBLIC.noLogin)


module.exports = router;
