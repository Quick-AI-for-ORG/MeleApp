const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ctrlPages = require("../Controllers/ctrlPages");


router.get("/",ctrlPages._KEEPER.noLogin);

router.get("/signup", ctrlPages._KEEPER.signup);

router.get("/login", ctrlPages._KEEPER.login);

router.get("/dashboard",ctrlPages._KEEPER.dashboard);

router.get("/upgrade", ctrlPages._KEEPER.upgrade);

router.post("/upgrade", ctrlPages._KEEPER.postUpgrade);

module.exports = router;
