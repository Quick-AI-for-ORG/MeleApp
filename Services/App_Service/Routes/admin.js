const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/dashboard", async (req, res) => {
  try {
    const meleDB = mongoose.connection.useDb("meleDB");

    const hivesCount = await meleDB.collection("hives").countDocuments();
    const apiariesCount = await meleDB.collection("apiaries").countDocuments();
    const usersCount = await meleDB.collection("users").countDocuments();
    const sensorsCount = await meleDB.collection("sensors").countDocuments();
    const productsCount = await meleDB.collection("products").countDocuments();

    const recentUsers = await meleDB
      .collection("users")
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // Get recent products
    const recentProducts = await meleDB
      .collection("products")
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    res.render("admin", {
      layout: false,
      stats: {
        hives: hivesCount,
        apiaries: apiariesCount,
        users: usersCount,
        sensors: sensorsCount,
        products: productsCount,
      },
      recentUsers,
      recentProducts,
    });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).send("Error fetching data");
  }
});

module.exports = router;
