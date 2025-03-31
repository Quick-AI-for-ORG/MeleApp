const models = {
  userModel: require("../Schemas/User"),
  sensorModel: require("../Schemas/Sensor"),
  hiveModel: require("../Schemas/Hive"),
  readingModel: require("../Schemas/Reading"),
  apiaryModel: require("../Schemas/Apiary"),
  threatModel: require("../Schemas/Threat"),
  productModel: require("../Schemas/Product"),
  keeperAssignmentModel: require("../Schemas/KeeperAssignment"),
  hiveUpgradeModel: require("../Schemas/HiveUpgrade"),
  questionModel: require("../Schemas/Question"),
};
const Log = require("../Schemas/Log");
const Result = require("../../Shared/Result");

const CRUDInterface = {
  create: async function (data, model, compareKey) {
    try {
      const compareClause = { [compareKey]: data[compareKey] };
      const existingRecord = await models[model].findOne(compareClause);
      if (!existingRecord) {
        let record = await models[model].create(data);
        await Log.create({log: `Created new record with ${compareKey}: ${data[compareKey]}.`, degree: 1,});
        return new Result(1, record._doc, `Created new record with ${compareKey}: ${data[compareKey]}.`);
      } else {
        await Log.create({log: `Record with ${compareKey}: ${data[compareKey]} already exists. Skipping creation.`,degree: 0,});
        return new Result(0, null,`Record with ${compareKey}: ${data[compareKey]} already exists. Skipping creation.`);
      }
    } catch (error) {
      await Log.create({ log: `Error adding data: ${error.message}.`, degree: -1 });
      return new Result(-1, null, `Error adding data: ${error.message}.`);
    }
  },
  modify: async function (primaryKey, newData, model, compareKey) {
    try {
      const compareClause = { [compareKey]: primaryKey };
      let record = await models[model].findOneAndUpdate(compareClause, { $set: newData }, { new: true });
      if (!record) {
        await Log.create({ log: `Record with ${compareKey}: ${primaryKey} not found. Skipping modification.`, degree: 0,});
        return new Result(0, null, `Record with ${compareKey}: ${primaryKey} not found. Skipping modification.`);
      } else {
        await Log.create({ log: `Updated record with ${compareKey}: ${newData[compareKey]}.`, degree: 1,});
        return new Result(1, record._doc, `Updated record with ${compareKey}: ${newData[compareKey]}.`);
      }
    } catch (error) {
      await Log.create({ log: `Error modifying data: ${error.message}.`, degree: -1 });
      return new Result(-1, null, `Error modifying data: ${error.message}.`);
    }
  },
  remove: async function (primaryKey, model, compareKey) {
    try {
      const compareClause = { [compareKey]: primaryKey };
      const record = await models[model].findOneAndDelete(compareClause);
      if (!record) {
        await Log.create({ log: `Record with ${compareKey}: ${primaryKey} not found. Skipping deletion.`, degree: 0,});
        return new Result(0, null, `Record with ${compareKey}: ${primaryKey} not found. Skipping deletion.`);
      } else {
        await Log.create({ log: `Deleted record with ${compareKey}: ${primaryKey}.`, degree: 1,});
        return new Result(1, record._doc, `Deleted record with ${compareKey}: ${primaryKey}.`);
      }
    } catch (error) {
      await Log.create({ log: `Error removing data: ${error.message}.`, degree: -1 });
      return new Result(-1, null, `Error removing data: ${error.message}.`);
    }
  },
  removeAll: async function (primaryKey, model, compareKey) {
    try {
      const compareClause = { [compareKey]: primaryKey };
      const result = await models[model].deleteMany(compareClause);

      if (result.deletedCount === 0) {
        await Log.create({ log: `No records found with ${compareKey}: ${primaryKey}. Skipping deletion.`, degree: 0,});
        return new Result(0, null, `No records found with ${compareKey}: ${primaryKey}. Skipping deletion.`);
      } else {
        await Log.create({ log: `Deleted ${result.deletedCount} records with ${compareKey}: ${primaryKey}.`, degree: 1,});
        return new Result(1, result, `Deleted ${result.deletedCount} records with ${compareKey}: ${primaryKey}.`);
      }
    } catch (error) {
      await Log.create({ log: `Error removing data: ${error.message}.`, degree: -1 });
      return new Result(-1, null, `Error removing data: ${error.message}.`);
    }
  },
  get: async function (primaryKey, model, compareKey) {
    try {
      const compareClause = { [compareKey]: primaryKey };
      const record = await models[model].findOne(compareClause);
      if (record) {
        await Log.create({ log: `Found record with ${compareKey}: ${primaryKey}.`, degree: 1,});
        return new Result(1, record._doc, `Found record with ${compareKey}: ${primaryKey}.`);
      } else {
        await Log.create({ log: `Record with ${compareKey}: ${primaryKey} not found.`, degree: 0,});
        return new Result( 0, null, `Record with ${compareKey}: ${primaryKey} not found.`);
      }
    } catch (error) {
      await Log.create({ log: `Error getting data: ${error.message}.`, degree: -1 });
      return new Result(-1, null, `Error getting data: ${error.message}.`);
    }
  },
  getNested: async function (primaryKeys, model, compareKeys) {
    try {
      const compareClause = compareKeys.reduce((acc, key, index) => {
        acc[key] = primaryKeys[index];
        return acc;
      }, {});
      const record = await models[model].findOne(compareClause);
      if (record) {
        await Log.create({ log: `Found record with ${JSON.stringify(compareClause)}.`, degree: 1 });
        return new Result(1, record._doc, `Found record with ${JSON.stringify(compareClause)}.`);
      } else {
        await Log.create({ log: `Record with ${JSON.stringify(compareClause)} not found.`, degree: 0 });
        return new Result(0, null, `Record with ${JSON.stringify(compareClause)} not found.`);
      }
    } catch (error) {
      await Log.create({ log: `Error getting nested data: ${error.message}.`, degree: -1 });
      return new Result(-1, null, `Error getting nested data: ${error.message}.`);
    }
  },
  getAll: async function (model) {
    try {
      const records = await models[model].find();
      const resultData = records.map((record) => record._doc);
      await Log.create({ log: `Found ${records.length} records in ${model}.`, degree: 1,});
      return new Result(1, resultData, `Found ${records.length} records in ${model}.`);
    } catch (error) {
      await Log.create({ log: `Error getting all data: ${error.message}.`, degree: -1 });
      return new Result(-1, null, `Error getting all data: ${error.message}.`);
    }
  },
  getAllFiltered: async function (primaryKey, model, compareKey) {
    try {
      const compareClause = { [compareKey]: primaryKey };
      const records = await models[model].find(compareClause);
      const resultData = records.map((record) => record._doc) || [];
      await Log.create({ log: `Found ${records.length} records in ${model} with ${compareClause}.`, degree: 1,});
      return new Result(1, resultData, `Found ${records.length} records in ${model} with ${compareClause}.`);
    } catch (error) {
      await Log.create({ log: `Error getting all data: ${error.message}.`, degree: -1 });
      return new Result(-1, null, `Error getting all data: ${error.message}.`);
    }
  },
  getAllSorted: async function (model, sortBy={createdAt:-1}, limit=0) {
    try {
      const records = await models[model].find().sort(sortBy).limit(limit);
      const resultData = records.map((record) => record._doc) || [];
      await Log.create({ log: `Found ${records.length} records in ${model} sorted by ${JSON.stringify(sortBy)}.`, degree: 1,});
      return new Result(1, resultData, `Found ${records.length} records in ${model} sorted by ${JSON.stringify(sortBy)}.`);
    } catch (error) {
      await Log.create({ log: `Error getting all data: ${error.message}.`, degree: -1 });
      return new Result(-1, null, `Error getting all data: ${error.message}.`);
    }
  },
  getCount: async function(model){
    try {
      const count = await models[model].countDocuments();
      await Log.create({ log: `Counted ${count} records in ${model}.`, degree: 1,});
      return new Result(1, count, `Counted ${count} records in ${model}.`);
    } catch (error) {
      await Log.create({ log: `Error counting data: ${error.message}.`, degree: -1 });
      return new Result(-1, null, `Error counting data: ${error.message}.`);
    }
  },
  getSelect: async function(primaryKey, model, compareKey, attribute){
    try{
      const compareClause = { [compareKey]: primaryKey };
      const selection = await models[model].findOne(compareClause).select(`${attribute} -_id`).lean();
      if (selection) {
        await Log.create({ log: `Found attribute ${attribute} in ${JSON.stringify(compareClause)}.`, degree: 1 });
        return new Result(1, selection[attribute], `Found attribute ${attribute} in ${JSON.stringify(compareClause)}.`);
      } else {
        await Log.create({ log: `Attribute ${attribute} in ${JSON.stringify(compareClause)} not found.`, degree: 0 });
        return new Result(0, null, `Attribute ${attribute} in ${JSON.stringify(compareClause)} not found.`);
      }
    } catch (error) {
      await Log.create({ log: `Error selecting attribute: ${error.message}.`, degree: -1 });
      return new Result(-1, null, `Error selecting attribute: ${error.message}.`);
    }
  } 
};

module.exports = CRUDInterface;
