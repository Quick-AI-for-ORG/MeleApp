const express = require("express");
const router = express.Router();
const { renderStreamPage } = require("../Controllers/streamController");

router.get("/", renderStreamPage);

module.exports = router;
