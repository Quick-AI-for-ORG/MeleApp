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
    },
    populate: async function (reference, object, compareKey) {
        try {
            const result = await CRUDInterface.getAllFiltered(object._id, reference, compareKey);
            if (!result.success.status) return result;
            await Log.create({ log: `Population for ${object} is valid.`, degree: 1 });
            return new Result(1, result.data, `Population for ${object} from ${reference} is successfull.`);
        } catch (error) {
            await Log.create({ log: `Error during population for ${object} from ${reference}: ${error}`, degree: -1 });
            return new Result(-1, null, `Error during population for ${object} from ${reference}: ${error}`);
        }
    }
};

module.exports = dependencyInterface;