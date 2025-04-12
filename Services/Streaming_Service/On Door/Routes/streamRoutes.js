const express = require("express");
const router = express.Router();
const { renderStreamPage } = require("../controllers/streamController");

router.get("/", renderStreamPage);

module.exports = router;
