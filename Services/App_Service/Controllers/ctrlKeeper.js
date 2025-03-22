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

const getKeepers = async (req, res) => {
    try {
        const result = await keeperAssignment.getAll();
        if(result.success.success) {
            const keepers = []
            for (let i = 0; i < result.data.length; i++) {
                let keeper = await controllers.user.getUser(result.data[i].keeperRef);
                if (!keeper.success.status) return keeper.toJSON();
                keeper = controllers.user._jsonToObject(userResult.data);
                keepers.append(keeper);
            }
            req.session.keepers = keepers;
            return new Result(1, keepers, 'Fetched keepers successfully').toJSON();
        }
        else return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching keepers: ${error.message}`).toJSON()
    }
}

const getApiaryKeepers = async (req, res) => {
    try {
        req.body._id = req.body.apiary
        const result = await controllers.apiary.getApiary(req, res);
        if (!result.success.status) return result;
        const apiary = controllers.apiary._jsonToObject(result.data);
        result = await apiary.getAssignemnt();
        if (!result.success.status) return result.toJSON();
        const keepers = []
        for (let i = 0; i < result.data.length; i++) {
            let keeper = await controllers.user.getUser(result.data[i].keeperRef);
            if (!keeper.success.status) return keeper.toJSON();
            keeper = controllers.user._jsonToObject(keeper.data);
            keepers.append( keeper);
        }
        return new Result(1, keepers, 'Fetched apiary keepers successfully')

    } catch (error) {
        return new Result(-1, null, `Error fetching apiary keepers: ${error.message}`).toJSON();
    }
}



module.exports = {
    assignKeeper,
    removeKeeper,
    getKeepers,
    getApiaryKeepers,
}