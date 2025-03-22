const Result = require("../../Shared/Result");
const keeperAssignment = require("../Models/KeeperAssignment");
const controllers = {
    user: require('./ctrlUser'),
    apiary: require('./ctrlApiary'),
    hive: require('./ctrlHive'),
}

const assignKeeper = async (req, res) => {
    try {
        const user = controllers.user._jsonToObject(req.session.user);
        const userJSON = {
            name: `${req.body.fname} ${req.body.lname}`,
            email: req.body.email,
            password: req.body.password,
            tel: req.body.phoneNumber,
            address: user.address || '',
            affiliation: user.affiliation || '',
        }
        const keeper = controllers.user._jsonToObject(userJSON, 'Keeper');
        let result = await keeper.create();
        if (!result.success.status) return res.json(result.toJSON());

        req.body._id = req.body.apiary
        result = controllers.apiary.getApiary(req,res)
        if (!result.success.status) return res.json(result.toJSON());

        const apiary = controllers.apiary._jsonToObject(result.data);
        const assignmentJSON = {
            apiaryRef: apiary._id,
            keeperRef: keeper._id,
        }
        const assignment = keeperAssignment._jsonToObject(assignmentJSON);
        result = await assignment.create();
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error assigning keeper: ${error.message}`).toJSON());
    }
}


const removeKeeper = async (req, res) => {
    try {
        const result = await keeperAssignment.remove(req.body._id);
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error deleting keeper: ${error.message}`).toJSON());
    }
}

module.exports = {
    assignKeeper,
    removeKeeper,
}