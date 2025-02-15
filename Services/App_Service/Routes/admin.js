const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ctrlHive = require("../Controllers/ctrlHive");
const ctrlAdmin = require("../Controllers/ctrlAdmin");
const ctrlPages = require("../Controllers/ctrlPages");

router.get("/dashboard", async (req, res) => {
  try {
    const meleDB = mongoose.connection.useDb("meleDB");

    const hivesCount = await meleDB.collection("hives").countDocuments();
    const apiariesCount = await meleDB.collection("apiaries").countDocuments();
    const usersCount = await meleDB.collection("users").countDocuments();
    const sensorsCount = await meleDB.collection("sensors").countDocuments();
    const productsCount = await meleDB.collection("products").countDocuments();

    const recentHives = await meleDB
      .collection("hives")
      .aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "apiaries",
            localField: "apiaryRef",
            foreignField: "_id",
            as: "apiary",
          },
        },
        {
          $addFields: {
            apiaryName: { $arrayElemAt: ["$apiary.name", 0] },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            apiaryName: 1,
            dimentions: 1,
            numberOfFrames: 1,
            streamUrl: 1,
            createdAt: 1,
          },
        },
      ])
      .toArray();

    // Get recent apiaries
    const recentApiaries = await meleDB
      .collection("apiaries")
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // Get recent sensors with additional fields - Fixed pipeline
    const recentSensors = await meleDB
      .collection("sensors")
      .aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "hives",
            localField: "hiveId",
            foreignField: "_id",
            as: "hive",
          },
        },
        {
          $addFields: {
            hiveName: { $arrayElemAt: ["$hive.name", 0] },
          },
        },
        {
          $project: {
            name: 1,
            sensorType: 1,
            status: 1,
            description: 1,
            imagePath: 1,
            modelName: 1,
            hiveName: 1,
            createdAt: 1,
          },
        },
      ])
      .toArray();

    // Updated users query to include name
    const recentUsers = await meleDB
      .collection("users")
      .find(
        {},
        { 
          projection: { 
            firstName: 1, 
            lastName: 1, 
            email: 1, 
            role: 1, // Add role to projection
            createdAt: 1 
          } 
        }
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
      recentHives,
      recentApiaries,
      recentSensors,
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

// Add new addition routes
router.post("/addUser", ctrlAdmin.addUser);
router.post("/addSensor", ctrlAdmin.addSensor);
router.post("/addProduct", ctrlAdmin.addProduct);

// Add update route
router.put("/updateUser", ctrlAdmin.updateUser);

// Add new routes for getting all items
router.get("/getAllUsers", ctrlAdmin.getAllUsers);
router.get("/getAllProducts", ctrlAdmin.getAllProducts);
router.get("/getAllSensors", ctrlAdmin.getAllSensors);
router.get("/getAllHives", ctrlAdmin.getAllHives);
router.get("/getAllApiaries", ctrlAdmin.getAllApiaries);


module.exports = router;
