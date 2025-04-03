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
            await Log.create({lLog: `Error validating ${object} creation: ${error.message}.`, degree: -1 });
            return new Result(-1, null, `Error validating ${object} creation: ${error.message}.`);
        }
    },
    cascade: async function (reference, object, compareKey) {
        try {
            for (let model of reference) {
                const result = await CRUDInterface.removeAll(object._id, model, compareKey);
                if (!result.success.status) return result;
            }
            await Log.create({ log: `Cascade deletion for ${object} is successfull.`, degree: 1 });
            return new Result(1, true, `Cascade deletion for ${object} is successful.`);
        } catch (error) {
            await Log.create({ log: `Error during cascade deletion for ${object}: ${error.message}.`, degree: -1 });
            return new Result(-1, null, `Error during cascade deletion for ${object}: ${error.message}.`);
        }
    },
    populate: async function (reference, object, compareKey) {
        try {
            const result = await CRUDInterface.getAllFiltered(object._id, reference, compareKey);
            if (!result.success.status) return result;
            await Log.create({ log: `Population for ${object} is successfull.`, degree: 1 });
            return new Result(1, result.data, `Population for ${object} from ${reference} is successfull.`);
        } catch (error) {
            await Log.create({ log: `Error during population for ${object} from ${reference}: ${error.message}.`, degree: -1 });
            return new Result(-1, null, `Error during population for ${object} from ${reference}: ${error.message}.`);
        }
    },
    populateSorted: async function (reference, primaryKeys, compareKeys, limit=7) {
        try {
            const result = await CRUDInterface.getAllNestedFilteredSorted(primaryKeys, reference, compareKeys, limit=limit);
            if (!result.success.status) return result;
            await Log.create({ log: `Population for ${object} is successfull.`, degree: 1 });
            return new Result(1, result.data, `Population for ${object} from ${reference} is successfull.`);
        } catch (error) {
            await Log.create({ log: `Error during population for ${object} from ${reference}: ${error.message}.`, degree: -1 });
            return new Result(-1, null, `Error during population for ${object} from ${reference}: ${error.message}.`);
        }
    },
    inverse: async function (reference, key, attribute) {
        try {
            const result = await CRUDInterface.getSelect(key, reference, "_id", attribute);
            if (!result.success.status) return result;
            await Log.create({ log: `Inversion for ${key} is successfull.`, degree: 1 });
            return new Result(1, result.data, `Inversion for ${key} from ${reference} is successfull.`);
        } catch (error) {
            await Log.create({ log: `Error during inversion for ${key} from ${reference}: ${error.message}.`, degree: -1 });
            return new Result(-1, null, `Error during inversion for ${key} from ${reference}: ${error.message}.`);
        }
    },
    inverseAll: async function (reference, array, attribute) {
        try {
            let selection = []
            for(const ref of array){
                const result = await CRUDInterface.getSelect(ref, reference, "_id", attribute);
                if (!result.success.status) return result;
                else selection.push(result.data)
            }
            await Log.create({ log: `Inversion for ${array.length} objects is successfull.`, degree: 1 });
            return new Result(1, selection, `Inversion for ${array.length} objects from ${reference} is successfull.`);
        } catch (error) {
            await Log.create({ log: `Error during inversion for ${attribute} from ${reference}: ${error.message}.`, degree: -1 });
            return new Result(-1, null, `Error during inversion for ${attribute} from ${reference}: ${error.message}.`);
        }  
    },
};

module.exports = dependencyInterface;