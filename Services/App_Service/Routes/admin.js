const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ctrlHive = require("../Controllers/ctrlHive");
const ctrlAdmin = require("../Controllers/ctrlAdmin");

router.get("/dashboard", async (req, res) => {
  try {
    const meleDB = mongoose.connection.useDb("meleDB");

    const hivesCount = await meleDB.collection("hives").countDocuments();
    const apiariesCount = await meleDB.collection("apiaries").countDocuments();
    const usersCount = await meleDB.collection("users").countDocuments();
    const sensorsCount = await meleDB.collection("sensors").countDocuments();
    const productsCount = await meleDB.collection("products").countDocuments();

    // Updated users query to include name
    const recentUsers = await meleDB
      .collection("users")
      .find(
        {},
        { projection: { firstName: 1, lastName: 1, email: 1, createdAt: 1 } }
      )
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // Map users to include full name
    const usersWithNames = recentUsers.map((user) => ({
      ...user,
      name:
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user.email.split("@")[0],
    }));

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
      recentUsers: usersWithNames,
      recentProducts,
    });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).send("Error fetching data");
  }
});

router.post("/addHive", ctrlHive.addHive);
router.post("/removeHive", ctrlHive.removeHive);

// Add new deletion routes
router.delete("/hive", ctrlAdmin.deleteHive);
router.delete("/apiary", ctrlAdmin.deleteApiary);
router.delete("/user", ctrlAdmin.deleteUser);
router.delete("/sensor", ctrlAdmin.deleteSensor);
router.delete("/product", ctrlAdmin.deleteProduct);

module.exports = router;
