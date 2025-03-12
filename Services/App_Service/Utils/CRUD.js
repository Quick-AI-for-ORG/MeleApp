const models = {
  userModel: require("../Schemas/User"),
  sensorModel: require("../Schemas/Sensor"),
  hiveModel: require("../Schemas/Hive"),
  readingModel: require("../Schemas/Reading"),
  apiaryModel: require("../Schemas/Apiary"),
  threatModel: require("../Schemas/Threat"),
  productModel: require("../Schemas/Product"),
  keeperAssignmentModel: require("../Schemas/KeeperAssignment"),
  hiveUpgradeModel: require("../Schemas/HiveUpgrade")
};
const Log = require("../Schemas/Log");
const Result = require("../../Shared/Result");

const CRUDInterface = {
  create: async function (data, model, compareKey) {
      try {
        const compareClause = {[compareKey]: data[compareKey]};
        const existingRecord = await models[model].findOne(compareClause);
        if (!existingRecord) {
          let record = await models[model].create(data);
          await Log.create({log: `Created new record with ${compareKey}: ${data[compareKey]}`, degree: 1});
          return new Result(1, record._doc, `Created new record with ${compareKey}: ${data[compareKey]}`);
        } else {
          await Log.create({log: `Record with ${compareKey}: ${data[compareKey]} already exists. Skipping creation.`, degree: 0});
          return new Result(0, null, `Record with ${compareKey}: ${data[compareKey]} already exists. Skipping creation.`);
        }
      } catch (error) {
        await Log.create({log: `Error adding data: ${error}`, degree: -1});
        return new Result(-1, null, `Error adding data: ${error}`);
      }
  },
  modify: async function (primaryKey, newData, model, compareKey) {
      try {
        const compareClause = {[compareKey]: primaryKey};
        let record = await models[model].findOneAndUpdate(compareClause, {$set: newData}, {new: true});
        if (!record) {
          await Log.create({log: `Record with ${compareKey}: ${primaryKey} not found. Skipping modification.`, degree: 0});
          return new Result(0, null, `Record with ${compareKey}: ${primaryKey} not found. Skipping modification.`);
        } else {
          await Log.create({log: `Updated record with ${compareKey}: ${newData[compareKey]}`, degree: 1});
          return new Result(1, record._doc, `Updated record with ${compareKey}: ${newData[compareKey]}`);
        }
      } catch (error) {
        await Log.create({log: `Error modifying data: ${error}`, degree: -1});
        return new Result(-1, null, `Error modifying data: ${error}`);
      }
  },
  remove: async function (primaryKey, model, compareKey) {
      try {
        const compareClause = {[compareKey]: primaryKey};
        const record = await models[model].findOneAndDelete(compareClause);
        if (!record) {
          await Log.create({log: `Record with ${compareKey}: ${primaryKey} not found. Skipping deletion.`, degree: 0});
          return new Result(0, null, `Record with ${compareKey}: ${primaryKey} not found. Skipping deletion.`);
        } else {
          await Log.create({log: `Deleted record with ${compareKey}: ${primaryKey}`, degree: 1});
          return new Result(1, record._doc, `Deleted record with ${compareKey}: ${primaryKey}`);
        }
      } catch (error) {
        await Log.create({log: `Error removing data: ${error}`, degree: -1});
        return new Result(-1, null, `Error removing data: ${error}`);
      }
  },
  removeAll: async function (primaryKey, model, compareKey) {
    try {
      const compareClause = { [compareKey]: primaryKey };
      const result = await models[model].deleteMany(compareClause);
      
      if (result.deletedCount === 0) {
        await Log.create({ log: `No records found with ${compareKey}: ${primaryKey}. Skipping deletion.`, degree: 0 });
        return new Result(0, null, `No records found with ${compareKey}: ${primaryKey}. Skipping deletion.`);
      } else {
        await Log.create({ log: `Deleted ${result.deletedCount} records with ${compareKey}: ${primaryKey}`, degree: 1 });
        return new Result(1, result, `Deleted ${result.deletedCount} records with ${compareKey}: ${primaryKey}`);
      }
    } catch (error) {
      await Log.create({ log: `Error removing data: ${error}`, degree: -1 });
      return new Result(-1, null, `Error removing data: ${error}`);
    }
  },  
  get: async function (primaryKey, model, compareKey) {
      try {
        const compareClause = {[compareKey]: primaryKey};
        const record = await models[model].findOne(compareClause);
        if (record) {
          await Log.create({log: `Found record with ${compareKey}: ${primaryKey}`, degree: 1});
          return new Result(1, record._doc, `Found record with ${compareKey}: ${primaryKey}`);
        } else {
          await Log.create({log: `Record with ${compareKey}: ${primaryKey} not found.`, degree: 0});
          return new Result(0, null, `Record with ${compareKey}: ${primaryKey} not found.`);
        }
      } catch (error) {
        await Log.create({log: `Error getting data: ${error}`, degree: -1});
        return new Result(-1, null, `Error getting data: ${error}`);
      }
  },
  getAll: async function (model) {
      try {
        const records = await models[model].find();
        const resultData = records.map(record => record._doc);
        await Log.create({log: `Found ${records.length} records in ${model}.`, degree: 1});
        return new Result(1, resultData, `Found ${records.length} records in ${model}..`);
      } catch (error) {
        await Log.create({log: `Error getting all data: ${error}`, degree: -1});
        return new Result(-1, null, `Error getting all data: ${error}`);
      }
  },
  getAllFiltered: async function (primaryKey, model, compareKey) {
    try {
      const compareClause = {[compareKey]: primaryKey};
      const records = await models[model].find(compareClause);
      const resultData = records.map(record => record._doc);
      await Log.create({ log: `Found ${records.length} records in ${model} with ${compareClause}.`, degree: 1 });
      return new Result(1, resultData, `Found ${records.length} records in ${model} with ${compareClause}.`);
    } catch (error) {
      await Log.create({log: `Error getting all data: ${error}`, degree: -1});
      return new Result(-1, null, `Error getting all data: ${error}`);
    }
  }
};

module.exports = CRUDInterface;
