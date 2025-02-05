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
      updatedAt: new Date()
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
      updatedAt: new Date()
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
      updatedAt: new Date()
    };
    const result = await meleDB.collection("products").insertOne(productData);
    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
