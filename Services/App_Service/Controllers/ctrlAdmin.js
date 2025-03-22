const mongoose = require("mongoose");
const meleDB = mongoose.connection.useDb("meleDB");
const Result = require("../../Shared/Result");
const controllers = {
  user: require("./ctrlUser"),
  apiary: require("./ctrlApiary"),
  sensor: require("./ctrlSensor"),
  product: require("./ctrlProduct"),
  hive: require("./ctrlHive"),
  upgrade: require("./ctrlUpgrade"),
  keeper: require("./ctrlKeeper"),
}

const deleteHive = async (req, res) => {
  try {
    const { hiveId } = req.body;
    await meleDB
      .collection("hives")
      .deleteOne({ _id: new mongoose.Types.ObjectId(hiveId) });
    return new Result(1, { success: true }, "Hive deleted successfully");
  } catch (error) {
    return new Result(-1, null, `Error deleting hive: ${error.message}`);
  }
};

const deleteApiary = async (req, res) => {
  try {
    const { apiaryId } = req.body;
    await meleDB
      .collection("apiaries")
      .deleteOne({ _id: new mongoose.Types.ObjectId(apiaryId) });
    // Also delete associated hives
    await meleDB.collection("hives").deleteMany({ apiaryId: apiaryId });
    return new Result(1, { success: true }, "Apiary and associated hives deleted successfully");
  } catch (error) {
    return new Result(-1, null, `Error deleting apiary: ${error.message}`);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;
    await meleDB
      .collection("users")
      .deleteOne({ _id: new mongoose.Types.ObjectId(userId) });
    return new Result(1, { success: true }, "User deleted successfully");
  } catch (error) {
    return new Result(-1, null, `Error deleting user: ${error.message}`);
  }
};

const deleteSensor = async (req, res) => {
  try {
    const { sensorId } = req.body;
    await meleDB
      .collection("sensors")
      .deleteOne({ _id: new mongoose.Types.ObjectId(sensorId) });
    return new Result(1, { success: true }, "Sensor deleted successfully");
  } catch (error) {
    return new Result(-1, null, `Error deleting sensor: ${error.message}`);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    await meleDB
      .collection("products")
      .deleteOne({ _id: new mongoose.Types.ObjectId(productId) });
    return new Result(1, { success: true }, "Product deleted successfully");
  } catch (error) {
    return new Result(-1, null, `Error deleting product: ${error.message}`);
  }
};

const addUser = async (req, res) => {
  try {
    const userData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await meleDB.collection("users").insertOne(userData);
    return new Result(1, { id: result.insertedId }, "User added successfully");
  } catch (error) {
    return new Result(-1, null, `Error adding user: ${error.message}`);
  }
};

const addSensor = async (req, res) => {
  try {
    const sensorData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await meleDB.collection("sensors").insertOne(sensorData);
    return new Result(1, { id: result.insertedId }, "Sensor added successfully");
  } catch (error) {
    return new Result(-1, null, `Error adding sensor: ${error.message}`);
  }
};

const addProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      price: parseFloat(req.body.price),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await meleDB.collection("products").insertOne(productData);
    return new Result(1, { id: result.insertedId }, "Product added successfully");
  } catch (error) {
    return new Result(-1, null, `Error adding product: ${error.message}`);
  }
};

const updateUser = async (req, res) => {
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
      return new Result(-1, null, "User not found");
    }

    return new Result(1, { success: true }, "User updated successfully");
  } catch (error) {
    return new Result(-1, null, `Error updating user: ${error.message}`);
  }
};

const getAllUsers = async (req, res) => {
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

    return new Result(1, formattedItems, "Users retrieved successfully");
  } catch (error) {
    return new Result(-1, null, `Error getting users: ${error.message}`);
  }
};

const getAllProducts = async (req, res) => {
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

    return new Result(1, formattedItems, "Products retrieved successfully");
  } catch (error) {
    return new Result(-1, null, `Error getting products: ${error.message}`);
  }
};

const getAllHives = async (req, res) => {
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

    return new Result(1, formattedItems, "Hives retrieved successfully");
  } catch (error) {
    return new Result(-1, null, `Error getting hives: ${error.message}`);
  }
};

const getAllApiaries = async (req, res) => {
  try {
    const items = await meleDB
      .collection("apiaries")
      .aggregate([
        {
          $lookup: {
            from: "hives",
            localField: "_id",
            foreignField: "apiaryRef",
            as: "hives",
          },
        },
        {
          $addFields: {
            hiveCount: { $size: "$hives" },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray();

    const formattedItems = items.map((item) => ({
      ...item,
      _id: item._id.toString(),
      name: item.name || "Unnamed Apiary",
      location: item.location || "No location",
      hiveCount: item.hiveCount || 0,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
    }));

    return new Result(1, formattedItems, "Apiaries retrieved successfully");
  } catch (error) {
    return new Result(-1, null, `Error getting apiaries: ${error.message}`);
  }
};

const getAllSensors = async (req, res) => {
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

    return new Result(1, formattedItems, "Sensors retrieved successfully");
  } catch (error) {
    return new Result(-1, null, `Error getting sensors: ${error.message}`);
  }
};

const getAllHiveUpgrades = async (req, res) => {
  try {
    const items = await meleDB
      .collection("hiveupgrades")
      .find(
        {},
        {
          projection: {
            _id: 1,
            operational: 1,
            createdAt: 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    const formattedItems = items.map((item) => ({
      ...item,
      _id: item._id.toString(),
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
    }));

    return new Result(1, formattedItems, "Hive upgrades retrieved successfully");
  } catch (error) {
    return new Result(-1, null, `Error getting hive upgrades: ${error.message}`);
  }
};

const deployHiveUpgrade = async (req, res) => {
  try {
    const { upgradeId } = req.body;
    const result = await meleDB.collection("hiveupgrades").updateOne(
      {
        _id: new mongoose.Types.ObjectId(upgradeId),
        operational: false, // Only allow update if it's not already deployed
      },
      {
        $set: {
          operational: true,
          deployedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return new Result(-1, null, "Upgrade not found or already deployed");
    }

    if (result.modifiedCount === 0) {
      return new Result(-1, null, "No changes made");
    }

    return new Result(1, { success: true }, "Hive upgrade deployed successfully");
  } catch (error) {
    return new Result(-1, null, `Error deploying hive upgrade: ${error.message}`);
  }
};

module.exports = {
  deleteHive,
  deleteApiary,
  deleteUser,
  deleteSensor,
  deleteProduct,
  addUser,
  addSensor,
  addProduct,
  updateUser,
  getAllUsers,
  getAllProducts,
  getAllHives,
  getAllApiaries,
  getAllSensors,
  getAllHiveUpgrades,
  deployHiveUpgrade
};