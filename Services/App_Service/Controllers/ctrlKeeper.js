const Result = require("../../Shared/Result");
const KeeperAssignment = require("../Models/KeeperAssignment");
const controllers = {
    user: require('./ctrlUser'),
    apiary: require('./ctrlApiary'),
    hive: require('./ctrlHive'),
}

const assignKeeper = async (req, res) => {
    try {
        const user = controllers.user._jsonToObject(req.session.user);
        let keeper = null
        const exists = await controllers.user.getUser(req, res);
        if (exists.success.type == "Failure") {
            const userJSON = {
                name: `${req.body.firstName} ${req.body.lastName}`,
                email: req.body.email,
                password: req.body.password,
                tel: req.body.phone,
                address: user.address || '',
                affiliation: user.affiliation || '',
            }
            keeper = controllers.user._jsonToObject(userJSON, 'Keeper');
            const result = await keeper.create();
            if (!result.success.status) return res.json(result.toJSON());
            keeper._id = result.data._id;
        }  
        else if (exists.success.status) keeper = controllers.user._jsonToObject(exists.data);
        else return res.json(exists.toJSON());
        
        req.body._id = req.body.apiary
        let result = await controllers.apiary.getApiary(req,res)
        if (!result.success.status) return res.json(result.toJSON());
        const apiary = controllers.apiary._jsonToObject(result.data);
        const assignmentJSON = {
            apiaryRef: apiary._id,
            beekeeperRef: keeper._id,
        }
        const assignment = new KeeperAssignment(assignmentJSON);
        result = await assignment.create();
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error assigning keeper: ${error.message}`).toJSON());
    }
}


const removeKeeper = async (req, res) => {
    try {
        const id = req.query._id || req.body._id;
        const result = await KeeperAssignment.remove(id);
        return res.json(result.toJSON());
    } catch (error) {
        return res.json(new Result(-1, null, `Error deleting keeper: ${error.message}`).toJSON());
    }
}

const getKeepers = async (req, res) => {
    try {
        const result = await KeeperAssignment.getAll();
        if(result.success.success) {
            const keepers = []
            for (let i = 0; i < result.data.length; i++) {
                let keeper = await controllers.user.getUser(result.data[i].beekeeperRef);
                if (keeper.success.status) {
                    keeper = controllers.user._jsonToObject(userResult.data);
                    keepers.append(keeper);
                }
            }
            req.session.keepers = keepers || [];
            return new Result(1, keepers, 'Fetched keepers successfully').toJSON();
        }
        else return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching keepers: ${error.message}`).toJSON()
    }
}

const getSortedKeepers = async (req, res) => {
    try {
        const sortBy = req.body.sortBy || { createdAt: -1 };
        const limit = req.body.limit || 10;
        const result = await KeeperAssignment.getAll(sortBy, limit);
        if (result.success.status) {
            const keepers = []
            for (let i = 0; i < result.data.length; i++) {
                let keeper = await controllers.user.getUser(result.data[i].beekeeperRef);
                if (keeper.success.status) {
                keeper = controllers.user._jsonToObject(userResult.data);
                keepers.append(keeper);
                }
            }
            req.session.keepers = keepers || [];
            return new Result(1, keepers, 'Fetched keepers successfully').toJSON();
        }
        else return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching sorted keepers: ${error.message}`).toJSON()
    }
}

const getApiaryKeepers = async (req, res) => {
    try {
        req.body._id = req.body.apiary
        let result = await controllers.apiary.getApiary(req, res);
        if (!result.success.status) return result;
        const apiary = controllers.apiary._jsonToObject(result.data);
        result = await apiary.getAssignemnt();
        if (!result.success.status) return result.toJSON();
        const keepers = []
        for (let i = 0; i < result.data.length; i++) {
            req.body._id = result.data[i].beekeeperRef;
            let keeper = await controllers.user.getUser(req, res);
            if (!keeper.success.status) return keeper.toJSON();
            keeper = controllers.user._jsonToObject(keeper.data);
            keepers.push(keeper);
        }
        return res.json(new Result(1, keepers, 'Fetched Apiary Keepers Successfully').toJSON());

    } catch (error) {
        return res.json(new Result(-1, null, `Error fetching Apiary Keepers: ${error.message}`).toJSON());
    }
}

const getKeeperApiaries = async (req, res) => {
    try {
        const user = controllers.user._jsonToObject(req.session.user);
        const result = await user.getAssigned();
        if (!result.success.status) return result.toJSON();
        const apiaries = []
        for (let i = 0; i < result.data.length; i++) {
            req.body._id = result.data[i].apiaryRef;
            let apiary = await controllers.apiary.getApiary(req, res);
            if (!apiary.success.status) return apiary.toJSON();
            apiary = controllers.apiary._jsonToObject(apiary.data);
            apiaries.push(apiary);
        }
        req.session.user.apiaries = apiaries;
        return new Result(1, apiaries, 'Fetched Apiaries Successfully').toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching Apiaries: ${error.message}`).toJSON();
    }
}

const getKeepersCount = async (req, res) => {
    try {
        const result = await KeeperAssignment.count();
        req.session.stats.keepers = result.data || 0
        return result.toJSON();
    } catch (error) {
        return new Result(-1, null, `Error fetching keeper count: ${error.message}`).toJSON();
    }
}



module.exports = {
    assignKeeper,
    removeKeeper,
    getKeepers,
    getApiaryKeepers,
    getKeeperApiaries,
    getSortedKeepers,
    getKeepersCount,
}