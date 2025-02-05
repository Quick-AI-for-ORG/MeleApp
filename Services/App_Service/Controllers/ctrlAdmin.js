const mongoose = require("mongoose");
const meleDB = mongoose.connection.useDb("meleDB");

exports.deleteHive = async (req, res) => {
  try {
    const { hiveId } = req.body;
    await meleDB
      .collection("hives")
      .deleteOne({ _id: new mongoose.Types.ObjectId(hiveId) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteApiary = async (req, res) => {
  try {
    const { apiaryId } = req.body;
    await meleDB
      .collection("apiaries")
      .deleteOne({ _id: new mongoose.Types.ObjectId(apiaryId) });
    // Also delete associated hives
    await meleDB.collection("hives").deleteMany({ apiaryId: apiaryId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;
    await meleDB
      .collection("users")
      .deleteOne({ _id: new mongoose.Types.ObjectId(userId) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteSensor = async (req, res) => {
  try {
    const { sensorId } = req.body;
    await meleDB
      .collection("sensors")
      .deleteOne({ _id: new mongoose.Types.ObjectId(sensorId) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    await meleDB
      .collection("products")
      .deleteOne({ _id: new mongoose.Types.ObjectId(productId) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addUser = async (req, res) => {
  try {
    const userData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await meleDB.collection("users").insertOne(userData);
    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addSensor = async (req, res) => {
  try {
    const sensorData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await meleDB.collection("sensors").insertOne(sensorData);
    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      price: parseFloat(req.body.price),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await meleDB.collection("products").insertOne(productData);
    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId, ...updateData } = req.body;
    const result = await meleDB.collection("users").updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const items = await meleDB
      .collection("users")
      .find(
        {},
        {
          projection: {
            firstName: 1,
            lastName: 1,
            email: 1,
            role: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    const formattedItems = items.map((item) => ({
      ...item,
      _id: item._id.toString(),
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
    }));

    res.json({ success: true, items: formattedItems });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const items = await meleDB
      .collection("products")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const formattedItems = items.map((item) => ({
      ...item,
      _id: item._id.toString(),
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
    }));

    res.json({ success: true, items: formattedItems });
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllHives = async (req, res) => {
  try {
    const items = await meleDB
      .collection("hives")
      .aggregate([
        { $sort: { createdAt: -1 } },
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
      ])
      .toArray();

    const formattedItems = items.map((item) => ({
      ...item,
      _id: item._id.toString(),
      apiaryRef: item.apiaryRef ? item.apiaryRef.toString() : null,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
    }));

    res.json({ success: true, items: formattedItems });
  } catch (error) {
    console.error("Error getting hives:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllApiaries = async (req, res) => {
  try {
    const items = await meleDB
      .collection("apiaries")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const formattedItems = items.map((item) => ({
      ...item,
      _id: item._id.toString(),
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
    }));

    res.json({ success: true, items: formattedItems });
  } catch (error) {
    console.error("Error getting apiaries:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllSensors = async (req, res) => {
  try {
    const items = await meleDB
      .collection("sensors")
      .aggregate([
        { $sort: { createdAt: -1 } },
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
      ])
      .toArray();

    const formattedItems = items.map((item) => ({
      ...item,
      _id: item._id.toString(),
      hiveId: item.hiveId ? item.hiveId.toString() : null,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
    }));

    res.json({ success: true, items: formattedItems });
  } catch (error) {
    console.error("Error getting sensors:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
