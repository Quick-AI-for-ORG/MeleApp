const CRUDInterface = require("./CRUD");
const Log = require("../Schemas/Log");
const Result = require("../../Shared/Result");

const dependencyInterface = {
    validate: async function (reference, object) {
        try {
            for (let model of Object.keys(reference)) {
                const result = await CRUDInterface.get(reference[model], model, "_id");
                if (!result.success.status) return result;
            }
            await Log.create({ log: `Creation for ${object} is valid.`, degree: 1 });
            return new Result(1, true, `Creation for ${object} is valid.`);
        }
        catch (error) {
            await Log.create({lLog: `Error validating ${object} creation: ${error}`, degree: -1 });
            return new Result(-1, null, `Error validating ${object} creation: ${error}`);
        }
    },
    cascade: async function (reference, object, compareKey) {
        try {
            for (let model of reference) {
                const result = await CRUDInterface.removeAll(object._id, model, compareKey);
                if (!result.success.status) return result;
            }
            await Log.create({ log: `Cascade deletion for ${object} is valid.`, degree: 1 });
            return new Result(1, true, `Cascade deletion for ${object} is valid.`);
        } catch (error) {
            await Log.create({ log: `Error during cascade deletion for ${object}: ${error}`, degree: -1 });
            return new Result(-1, null, `Error during cascade deletion for ${object}: ${error}`);
        }
    }
};

module.exports = dependencyInterface;